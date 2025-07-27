require("dotenv").config();
const TwitterProfile = require("../models/TwitterProfile.js");
const LinkedInProfile = require("../models/LinkedProfile.js");
const { executePosts } = require("./services.js");
const { uploadToR2 } = require('./r2Storage.js');
const fs = require('fs');

module.exports.postAll = async (req, res) => {
  try {
    const {
      userId,
      content,
      postToTwitter,
      postToLinkedIn,
      isScheduled,
      scheduleDate,
      scheduleTime,
      title,
      tags: rawTags,
      publishStatus,
      contentFormat,
    } = req.body;

    const mediaFile = req.file;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!content && !mediaFile) {
      return res.status(400).json({
        success: false,
        message: "Content or media file is required",
      });
    }

    // Check if at least one platform is selected
    if (postToTwitter !== 'true' && postToLinkedIn !== 'true') {
      return res.status(400).json({
        success: false,
        message: "At least one platform (Twitter or LinkedIn) must be selected",
      });
    }

    // Find user accounts
    const [twitterUser, linkedinUser] = await Promise.all([
      postToTwitter === 'true' ? TwitterProfile.findOne({ where: { user_id: userId } }) : null,
      postToLinkedIn === 'true' ? LinkedInProfile.findOne({ where: { user_id: userId } }) : null
    ]);

    // Validate platform connections
    if (postToTwitter === 'true' && !twitterUser) {
      return res.status(400).json({
        success: false,
        message: "Twitter account not found. Please connect your Twitter account",
      });
    }

    if (postToLinkedIn === 'true' && !linkedinUser) {
      return res.status(400).json({
        success: false,
        message: "LinkedIn account not found. Please connect your LinkedIn account",
      });
    }

    let mediaUrl = null;
    // Upload media to R2 if present
    if (mediaFile) {
      try {
        const uploadResult = await uploadToR2(mediaFile, userId);
        mediaUrl = uploadResult.url;
        
        // Clean up the temporary file
        if (fs.existsSync(mediaFile.path)) {
          fs.unlinkSync(mediaFile.path);
        }
      } catch (uploadError) {
        console.error('R2 upload failed:', uploadError);
        // Clean up the temporary file if upload fails
        if (fs.existsSync(mediaFile.path)) {
          fs.unlinkSync(mediaFile.path);
        }
        
        return res.status(500).json({
          success: false,
          message: 'Failed to upload media file',
          details: uploadError.message
        });
      }
    }

    // Prepare post content
    const postContent = {
      content,
      postToTwitter,
      postToLinkedIn,
      isScheduled,
      scheduleDate,
      scheduleTime,
      title,
      tags: rawTags,
      publishStatus,
      contentFormat,
      mediaUrl // Include the media URL if available
    };

    // Execute posts
    const PostResponse = await executePosts(
      twitterUser?.twitter_token,
      twitterUser?.twitter_secret,
      linkedinUser?.access_token,
      postContent,
      mediaUrl, // Pass the URL instead of the file object
      linkedinUser?.sub
    );

    return res.status(200).json({
      success: true,
      message: "Post operation completed successfully",
      data: PostResponse,
    });

  } catch (error) {
    console.error('Error in postAll:', error);
    
    // Clean up media file in case of error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: error.error || 'An error occurred while processing your post',
      details: error.details || error.message
    });
  }
};
