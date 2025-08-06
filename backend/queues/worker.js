require("dotenv/config");
const amqp = require("amqplib");
const path = require("path");
const { postTwitter, postLinkedIn } = require("../posts/helperFunctions");
const fs = require("fs");

const QUEUE_NAME = process.env.QUEUE_NAME || "";
const RABBITMQURL = process.env.RABBITMQ_URL || "";

module.exports.connectQueue = async () => {
  try {
    const connection = await amqp.connect(RABBITMQURL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
    });
    return channel;
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
    throw error;
  }
};

module.exports.startWorker = async () => {
  let connection;
  try {
    connection = await amqp.connect(RABBITMQURL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
    });

    channel.prefetch(1);
    console.log("✅ Worker started, waiting for messages...");

    channel.consume(QUEUE_NAME, async (msg) => {
      let message;
      try {
        message = JSON.parse(msg.content.toString());
        const now = Date.now();

        // If message isn't ready to be processed yet
        if (message.scheduledTime > now) {
          channel.nack(msg, false, true);
          return;
        }

        console.log(`Processing scheduled post with ${Array.isArray(message.mediaPaths) ? message.mediaPaths.length : message.mediaPath ? 1 : 0} media files`);

        // Process Twitter post if enabled
        if (message.postToTwitter === "true" && message.user?.twitter) {
          const mediaFiles = getMediaFiles(message);
          console.log(`Posting to Twitter with ${mediaFiles?.length || 0} media files`);
          
          await postTwitter(
            {
              twittertoken: message.user.twitter.twittertoken,
              twittertokenSecret: message.user.twitter.twittertokenSecret,
            },
            message.content,
            mediaFiles
          );
        }

        // Process LinkedIn post if enabled
// Update the LinkedIn posting logic in your worker:
// Update the LinkedIn posting logic in your worker:
if (message.postToLinkedIn === "true" && message.user?.linkedin) {
  const tags = message.tags ? JSON.parse(message.tags) : [];
  const mediaFiles = getMediaFiles(message);
  
  if (mediaFiles && mediaFiles.length > 0) {
    console.log(`Preparing LinkedIn post with media file: ${mediaFiles[0].path}`);
    
    // LinkedIn requires specific media handling
    const linkedInMediaFile = {
      path: mediaFiles[0].path,
      mimetype: mediaFiles[0].mimetype,
      originalname: mediaFiles[0].originalname
    };

    // Verify the file exists and is readable
    if (!fs.existsSync(linkedInMediaFile.path)) {
      throw new Error(`Media file not found: ${linkedInMediaFile.path}`);
    }

    console.log(`Media file details: ${JSON.stringify({
      size: fs.statSync(linkedInMediaFile.path).size,
      type: linkedInMediaFile.mimetype,
      lastModified: fs.statSync(linkedInMediaFile.path).mtime
    })}`);

    await postLinkedIn(
      message.user.linkedin.linkedinId,
      message.user.linkedin.linkedinAccessToken,
      message.content,
      message.title,
      tags,
      linkedInMediaFile,  // Make sure this contains all required fields
      message.contentFormat,
      message.publishStatus === "draft"
    );
  } else {
    console.log("Creating LinkedIn post without media");
    await postLinkedIn(
      message.user.linkedin.linkedinId,
      message.user.linkedin.linkedinAccessToken,
      message.content,
      message.title,
      tags,
      null,
      message.contentFormat,
      message.publishStatus === "draft"
    );
  }
}

        // Clean up media files
        cleanupMediaFiles(message);

        channel.ack(msg);
        console.log("✅ Scheduled post processed successfully");
      } catch (error) {
        console.error("❌ Error processing scheduled post:", error.message);
        handleFailedMessage(channel, msg, message, error);
      }
    });

    // Handle connection errors
    connection.on("close", () => {
      console.error("RabbitMQ connection closed, reconnecting...");
      setTimeout(startWorker, 5000);
    });

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err);
    });
  } catch (error) {
    console.error("Worker startup error:", error);
    if (connection) await connection.close();
    setTimeout(startWorker, 5000);
  }
};

// Helper function to get media files array
function getMediaFiles(message) {
  if (!message.mediaPaths && !message.mediaPath) return null;

  const paths = Array.isArray(message.mediaPaths) 
    ? message.mediaPaths 
    : message.mediaPath 
      ? [message.mediaPath] 
      : [];

  return paths.map(filePath => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Media file not found: ${filePath}`);
    }
    return {
      path: filePath,
      originalname: path.basename(filePath),
      mimetype: getMimeType(filePath)
    };
  });
}

// Helper function to clean up media files
function cleanupMediaFiles(message) {
  const filesToClean = Array.isArray(message.mediaPaths)
    ? message.mediaPaths
    : message.mediaPath
      ? [message.mediaPath]
      : [];

  filesToClean.forEach(filePath => {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up file: ${filePath}`);
      }
    } catch (cleanupError) {
      console.error(`Error cleaning up file ${filePath}:`, cleanupError);
    }
  });
}

// Helper function to handle failed messages
function handleFailedMessage(channel, msg, message, error) {
  const retryCount = msg.properties.headers["x-retry-count"] || 0;
  
  if (retryCount < 3) {
    const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    console.log(`Retrying message in ${delay}ms (attempt ${retryCount + 1})`);
    channel.nack(msg, false, false);
    setTimeout(() => {
      channel.publish("", QUEUE_NAME, msg.content, {
        headers: { "x-retry-count": retryCount + 1 },
      });
    }, delay);
  } else {
    // Move to dead letter queue after max retries
    console.error("Max retries reached for message:", message);
    channel.nack(msg, false, false);
    
    // Archive failed message and media files
    archiveFailedPost(message);
  }
}

// Helper function to archive failed posts
function archiveFailedPost(message) {
  if (!message.mediaPaths && !message.mediaPath) return;

  const failedDir = "failed_posts";
  if (!fs.existsSync(failedDir)) {
    fs.mkdirSync(failedDir, { recursive: true });
  }

  const filesToArchive = Array.isArray(message.mediaPaths)
    ? message.mediaPaths
    : [message.mediaPath];

  filesToArchive.forEach(filePath => {
    if (filePath && fs.existsSync(filePath)) {
      try {
        const newPath = `${failedDir}/${Date.now()}_${path.basename(filePath)}`;
        fs.renameSync(filePath, newPath);
        console.log(`Archived failed media file to: ${newPath}`);
      } catch (archiveError) {
        console.error(`Error archiving file ${filePath}:`, archiveError);
      }
    }
  });
}

// Helper function to get MIME type from file extension
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}