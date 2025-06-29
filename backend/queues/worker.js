require("dotenv/config");
const amqp = require("amqplib");
const path = require("path"); // Added missing path module
const { postTwitter, postLinkedIn } = require("../posts/functions");
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
      let message; // Declare message at the start of the callback
      try {
        message = JSON.parse(msg.content.toString());
        const now = Date.now();

        // If message isn't ready to be processed yet
        if (message.scheduledTime > now) {
          // Requeue with delay (RabbitMQ 3.8+)
          channel.nack(msg, false, true);
          return;
        }

        // Process Twitter post if enabled
        if (message.postToTwitter === "true" && message.user?.twitter) {
          await postTwitter(
            {
              twittertoken: message.user.twitter.twittertoken,
              twittertokenSecret: message.user.twitter.twittertokenSecret,
            },
            message.content,
            message.mediaPath
              ? {
                  path: message.mediaPath,
                  originalname: path.basename(message.mediaPath),
                }
              : null
          );
        }

        // Process LinkedIn post if enabled
        if (message.postToLinkedIn === "true" && message.user?.linkedin) {
          const tags = message.tags ? JSON.parse(message.tags) : [];
          await postLinkedIn(
            message.user.linkedin.linkedinId,
            message.user.linkedin.linkedinAccessToken,
            message.content,
            message.title,
            tags,
            message.mediaPath
              ? {
                  path: message.mediaPath,
                  mimetype: getMimeType(message.mediaPath),
                }
              : null,
            message.contentFormat,
            message.publishStatus === "draft"
          );
        }

        // Clean up media file
        if (message.mediaPath && fs.existsSync(message.mediaPath)) {
          fs.unlinkSync(message.mediaPath);
        }

        channel.ack(msg);
        console.log("Scheduled post processed successfully");
      } catch (error) {
        console.error("Error processing scheduled post:", error);

        // Implement exponential backoff for retries
        const retryCount = msg.properties.headers["x-retry-count"] || 0;
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          channel.nack(msg, false, false);
          setTimeout(() => {
            channel.publish("", QUEUE_NAME, msg.content, {
              headers: { "x-retry-count": retryCount + 1 },
            });
          }, delay);
        } else {
          // Move to dead letter queue after max retries
          channel.nack(msg, false, false);
          console.error("Max retries reached for message:", message);

          // Archive failed message
          if (message && message.mediaPath && fs.existsSync(message.mediaPath)) {
            const failedDir = "failed_posts";
            if (!fs.existsSync(failedDir)) {
              fs.mkdirSync(failedDir, { recursive: true });
            }
            fs.renameSync(
              message.mediaPath,
              `${failedDir}/${path.basename(message.mediaPath)}`
            );
          }
        }
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

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".mp4":
      return "video/mp4";
    default:
      return "application/octet-stream";
  }
}