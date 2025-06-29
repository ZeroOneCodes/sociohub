require("dotenv").config();
const { postTwitter, postLinkedIn } = require("./helperFunctions");
const { connectQueue } = require('../queues/worker');
const fs = require('fs');

const executePosts = async (
  twittertoken,
  twittertokenSecret,
  linkedAccesToken,
  postContent,
  mediaFile,
  linkedinId
) => {
  try {
    let twitterResponse, linkedInResponse;
    const {
      postToTwitter,
      postToLinkedIn,
      content,
      title,
      rawTags,
      publishStatus,
      contentFormat,
      isScheduled,
      scheduleDate,
      scheduleTime
    } = postContent;

    // Immediate posting logic
    if (isScheduled !== 'true') {
      if (postToTwitter === "true") {
        twitterResponse = await postTwitter(
          { twittertoken, twittertokenSecret },
          content,
          mediaFile
        );
      }

      if (postToLinkedIn === 'true') {
        const tags = rawTags ? JSON.parse(rawTags) : [];
        const isDraft = publishStatus === 'draft';

        linkedInResponse = await postLinkedIn(
          linkedinId,
          linkedAccesToken,
          content,
          title,
          tags,
          mediaFile,
          contentFormat,
          isDraft
        );
      }

      // Clean up media file if it exists
      if (mediaFile && fs.existsSync(mediaFile.path)) {
        fs.unlinkSync(mediaFile.path);
      }

      return {
        message: 'Post successful',
        twitter: twitterResponse,
        linkedIn: linkedInResponse
      };
    }
    // Scheduling logic
    else {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
      
      if (scheduledDateTime <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }

      // Save media file to a permanent location if it exists
      let mediaPath = null;
      if (mediaFile) {
        const permanentPath = `scheduled_media/${Date.now()}_${mediaFile.originalname}`;
        fs.mkdirSync('scheduled_media', { recursive: true });
        fs.copyFileSync(mediaFile.path, permanentPath);
        fs.unlinkSync(mediaFile.path);
        mediaPath = permanentPath;
      }

      // Prepare message for queue
      const message = {
        scheduledTime: scheduledDateTime.getTime(),
        content,
        postToTwitter,
        postToLinkedIn,
        title,
        tags: rawTags,
        publishStatus,
        contentFormat,
        mediaPath,
        user: {
          twitter: postToTwitter === 'true' ? {
            twittertoken,
            twittertokenSecret
          } : null,
          linkedin: postToLinkedIn === 'true' ? {
            linkedinAccessToken: linkedAccesToken,
            linkedinId
          } : null
        }
      };

      // Connect to RabbitMQ and send message
      const channel = await connectQueue();
      await channel.sendToQueue(
        process.env.QUEUE_NAME,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      return { 
        message: `Post scheduled for ${scheduleDate} at ${scheduleTime}`,
        scheduledTime: scheduledDateTime
      };
    }
  } catch (error) {
    console.error('Error in combined posting:', error);
    
    // Clean up media file in case of error
    if (mediaFile && fs.existsSync(mediaFile.path)) {
      fs.unlinkSync(mediaFile.path);
    }

    throw {
      error: 'An error occurred while posting',
      details: error.message
    };
  }
};

module.exports = {
  executePosts
};

