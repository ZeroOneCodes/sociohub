require("dotenv").config();
const TwitterProfile = require("../models/TwitterProfile.js");
const LinkedInProfile = require("../models/LinkedProfile.js");
const { executePosts } = require("./services.js");
const fs = require('fs');
const path = require('path');

// Helper function to clean up uploaded files
const cleanupFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    } catch (error) {
      console.error(`Error cleaning up file ${filePath}:`, error.message);
    }
  }
};

// Helper function to validate media file for each platform
const validateMediaFile = (mediaFile, platforms) => {
  if (!mediaFile) return { valid: true };

  const errors = [];
  const fileSize = fs.statSync(mediaFile.path).size;
  const mimetype = mediaFile.mimetype;

  // Twitter validation
  if (platforms.twitter) {
    const allowedTwitterImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedTwitterVideoTypes = ['video/mp4'];
    const maxTwitterImageSize = 5 * 1024 * 1024; // 5MB
    const maxTwitterVideoSize = 512 * 1024 * 1024; // 512MB

    if (mimetype.startsWith('image/')) {
      if (!allowedTwitterImageTypes.includes(mimetype)) {
        errors.push(`Twitter doesn't support ${mimetype} images`);
      } else if (fileSize > maxTwitterImageSize) {
        errors.push(`Image too large for Twitter (max 5MB, got ${Math.round(fileSize / 1024 / 1024)}MB)`);
      }
    } else if (mimetype.startsWith('video/')) {
      if (!allowedTwitterVideoTypes.includes(mimetype)) {
        errors.push(`Twitter doesn't support ${mimetype} videos`);
      } else if (fileSize > maxTwitterVideoSize) {
        errors.push(`Video too large for Twitter (max 512MB, got ${Math.round(fileSize / 1024 / 1024)}MB)`);
      }
    }
  }

  // LinkedIn validation
  if (platforms.linkedin) {
    const allowedLinkedInImageTypes = ['image/jpeg', 'image/png'];
    const allowedLinkedInVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
    const maxLinkedInImageSize = 8 * 1024 * 1024; // 8MB
    const maxLinkedInVideoSize = 200 * 1024 * 1024; // 200MB

    if (mimetype.startsWith('image/')) {
      if (!allowedLinkedInImageTypes.includes(mimetype)) {
        errors.push(`LinkedIn doesn't support ${mimetype} images`);
      } else if (fileSize > maxLinkedInImageSize) {
        errors.push(`Image too large for LinkedIn (max 8MB, got ${Math.round(fileSize / 1024 / 1024)}MB)`);
      }
    } else if (mimetype.startsWith('video/')) {
      if (!allowedLinkedInVideoTypes.includes(mimetype)) {
        errors.push(`LinkedIn doesn't support ${mimetype} videos`);
      } else if (fileSize > maxLinkedInVideoSize) {
        errors.push(`Video too large for LinkedIn (max 200MB, got ${Math.round(fileSize / 1024 / 1024)}MB)`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
};

module.exports.postAll = async (req, res) => {
  let mediaFile = null;
  
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

    mediaFile = req.file;

    // Log request details for debugging
    console.log('Post request received:', {
      userId,
      postToTwitter,
      postToLinkedIn,
      hasMediaFile: !!mediaFile,
      mediaType: mediaFile?.mimetype,
      mediaSize: mediaFile ? fs.statSync(mediaFile.path).size : 0
    });

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    // Check if at least one platform is selected
    if (postToTwitter !== 'true' && postToLinkedIn !== 'true') {
      return res.status(400).json({
        success: false,
        message: "At least one platform (Twitter or LinkedIn) must be selected",
      });
    }

    // Validate media file for selected platforms
    if (mediaFile) {
      const validation = validateMediaFile(mediaFile, {
        twitter: postToTwitter === 'true',
        linkedin: postToLinkedIn === 'true'
      });

      if (!validation.valid) {
        cleanupFile(mediaFile.path);
        return res.status(400).json({
          success: false,
          message: "Media file validation failed",
          errors: validation.errors
        });
      }
    }

    // Find user accounts
    const [twitterUser, linkedinUser] = await Promise.all([
      postToTwitter === 'true' ? TwitterProfile.findOne({ where: { user_id: userId } }) : null,
      postToLinkedIn === 'true' ? LinkedInProfile.findOne({ where: { user_id: userId } }) : null
    ]);

    // Validate platform connections
    if (postToTwitter === 'true' && !twitterUser) {
      cleanupFile(mediaFile?.path);
      return res.status(400).json({
        success: false,
        message: "Twitter account not found. Please connect your Twitter account",
      });
    }

    if (postToLinkedIn === 'true' && !linkedinUser) {
      cleanupFile(mediaFile?.path);
      return res.status(400).json({
        success: false,
        message: "LinkedIn account not found. Please connect your LinkedIn account",
      });
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
    };

    console.log('Executing posts with content:', postContent);

    // Execute posts
    const PostResponse = await executePosts(
      twitterUser?.twitter_token,
      twitterUser?.twitter_secret,
      linkedinUser?.access_token,
      postContent,
      mediaFile,
      linkedinUser?.sub
    );

    // Clean up media file after successful posting
    cleanupFile(mediaFile?.path);

    return res.status(200).json({
      success: true,
      message: "Post operation completed successfully",
      data: PostResponse,
    });

  } catch (error) {
    console.error('Error in postAll:', error);
    
    // Clean up media file in case of error
    cleanupFile(mediaFile?.path);

    // Determine error message and status code
    let statusCode = 500;
    let message = 'An error occurred while processing your post';
    
    if (error.message?.includes('Media validation failed')) {
      statusCode = 400;
      message = error.message;
    } else if (error.message?.includes('Media upload failed')) {
      statusCode = 400;
      message = 'Media upload failed. Please check your file and try again.';
    } else if (error.message?.includes('Tweet posting failed')) {
      statusCode = 400;
      message = 'Failed to post to Twitter. Please check your account connection.';
    } else if (error.message?.includes('not found')) {
      statusCode = 404;
      message = error.message;
    } else if (error.message?.includes('account not found')) {
      statusCode = 400;
      message = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      error_code: error.code || 'UNKNOWN_ERROR'
    });
  }
};