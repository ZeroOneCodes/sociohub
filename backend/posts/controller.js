require("dotenv").config();
const TwitterProfile = require("../models/TwitterProfile.js");
const LinkedInProfile = require("../models/LinkedProfile.js");
const TwitterPosts = require("../models/TwitterPosts.js");
const LinkedInPosts = require("../models/LinkedInPosts.js")
const {
  executePosts,
  deleteTweet,
  getUserTweets,
  deleteLinkedInPost,
  getLinkedInPosts,
} = require("./services.js");
const fs = require("fs");
const path = require("path");

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
    const allowedTwitterImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const allowedTwitterVideoTypes = ["video/mp4"];
    const maxTwitterImageSize = 5 * 1024 * 1024; // 5MB
    const maxTwitterVideoSize = 512 * 1024 * 1024; // 512MB

    if (mimetype.startsWith("image/")) {
      if (!allowedTwitterImageTypes.includes(mimetype)) {
        errors.push(`Twitter doesn't support ${mimetype} images`);
      } else if (fileSize > maxTwitterImageSize) {
        errors.push(
          `Image too large for Twitter (max 5MB, got ${Math.round(
            fileSize / 1024 / 1024
          )}MB)`
        );
      }
    } else if (mimetype.startsWith("video/")) {
      if (!allowedTwitterVideoTypes.includes(mimetype)) {
        errors.push(`Twitter doesn't support ${mimetype} videos`);
      } else if (fileSize > maxTwitterVideoSize) {
        errors.push(
          `Video too large for Twitter (max 512MB, got ${Math.round(
            fileSize / 1024 / 1024
          )}MB)`
        );
      }
    }
  }

  // LinkedIn validation
  if (platforms.linkedin) {
    const allowedLinkedInImageTypes = ["image/jpeg", "image/png"];
    const allowedLinkedInVideoTypes = [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
    ];
    const maxLinkedInImageSize = 8 * 1024 * 1024; // 8MB
    const maxLinkedInVideoSize = 200 * 1024 * 1024; // 200MB

    if (mimetype.startsWith("image/")) {
      if (!allowedLinkedInImageTypes.includes(mimetype)) {
        errors.push(`LinkedIn doesn't support ${mimetype} images`);
      } else if (fileSize > maxLinkedInImageSize) {
        errors.push(
          `Image too large for LinkedIn (max 8MB, got ${Math.round(
            fileSize / 1024 / 1024
          )}MB)`
        );
      }
    } else if (mimetype.startsWith("video/")) {
      if (!allowedLinkedInVideoTypes.includes(mimetype)) {
        errors.push(`LinkedIn doesn't support ${mimetype} videos`);
      } else if (fileSize > maxLinkedInVideoSize) {
        errors.push(
          `Video too large for LinkedIn (max 200MB, got ${Math.round(
            fileSize / 1024 / 1024
          )}MB)`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
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
    console.log("Post request received:", {
      userId,
      postToTwitter,
      postToLinkedIn,
      hasMediaFile: !!mediaFile,
      mediaType: mediaFile?.mimetype,
      mediaSize: mediaFile ? fs.statSync(mediaFile.path).size : 0,
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
    if (postToTwitter !== "true" && postToLinkedIn !== "true") {
      return res.status(400).json({
        success: false,
        message: "At least one platform (Twitter or LinkedIn) must be selected",
      });
    }

    // Validate media file for selected platforms
    if (mediaFile) {
      const validation = validateMediaFile(mediaFile, {
        twitter: postToTwitter === "true",
        linkedin: postToLinkedIn === "true",
      });

      if (!validation.valid) {
        cleanupFile(mediaFile.path);
        return res.status(400).json({
          success: false,
          message: "Media file validation failed",
          errors: validation.errors,
        });
      }
    }

    // Find user accounts
    const [twitterUser, linkedinUser] = await Promise.all([
      postToTwitter === "true"
        ? TwitterProfile.findOne({ where: { user_id: userId } })
        : null,
      postToLinkedIn === "true"
        ? LinkedInProfile.findOne({ where: { user_id: userId } })
        : null,
    ]);

    // Validate platform connections
    if (postToTwitter === "true" && !twitterUser) {
      cleanupFile(mediaFile?.path);
      return res.status(400).json({
        success: false,
        message:
          "Twitter account not found. Please connect your Twitter account",
      });
    }

    if (postToLinkedIn === "true" && !linkedinUser) {
      cleanupFile(mediaFile?.path);
      return res.status(400).json({
        success: false,
        message:
          "LinkedIn account not found. Please connect your LinkedIn account",
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

    console.log("Executing posts with content:", postContent);

    // Execute posts
    const PostResponse = await executePosts(
      twitterUser?.twitter_token,
      twitterUser?.twitter_secret,
      linkedinUser?.access_token,
      postContent,
      mediaFile,
      linkedinUser?.sub
    );

    if (postToTwitter === "true" && PostResponse?.twitter?.data) {
      const now = new Date();
      await TwitterPosts.create({
        user_id: userId,
        twitter_post_id: PostResponse.twitter.data.id,
        content: PostResponse.twitter.data.text,
        post_created_at: now, 
        created_at: now,
        updated_at: now
      });
    }
    if (postToTwitter === "true" && PostResponse?.data?.twitter?.data?.id) {
      const now = new Date();
      await TwitterPosts.create({
        user_id: userId,
        twitter_post_id: PostResponse.twitter.data.id,
        content: PostResponse.twitter.data.text,
        post_created_at: now, 
        created_at: now,
        updated_at: now
      });
    }
    if (postToLinkedIn === "true" && PostResponse?.linkedIn?.id) {
      const now = new Date();
      await LinkedInPosts.create({
        user_id: userId,
        linkedin_post_id: PostResponse.linkedIn.id,
        content: content,
        post_created_at: now,
        created_at: now,
        updated_at: now
      });
    }

    cleanupFile(mediaFile?.path);

    return res.status(200).json({
      success: true,
      message: "Post operation completed successfully",
      data: PostResponse,
    });
  } catch (error) {
    console.error("Error in postAll:", error);

    // Clean up media file in case of error
    cleanupFile(mediaFile?.path);

    // Determine error message and status code
    let statusCode = 500;
    let message = "An error occurred while processing your post";

    if (error.message?.includes("Media validation failed")) {
      statusCode = 400;
      message = error.message;
    } else if (error.message?.includes("Media upload failed")) {
      statusCode = 400;
      message = "Media upload failed. Please check your file and try again.";
    } else if (error.message?.includes("Tweet posting failed")) {
      statusCode = 400;
      message =
        "Failed to post to Twitter. Please check your account connection.";
    } else if (error.message?.includes("not found")) {
      statusCode = 404;
      message = error.message;
    } else if (error.message?.includes("account not found")) {
      statusCode = 400;
      message = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: message,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
      error_code: error.code || "UNKNOWN_ERROR",
    });
  }
};

module.exports.deleteTweet = async (req, res) => {
  const { userId, tweetId } = req.body;
  console.log("t", tweetId);
  try {
    const twitterProfile = await TwitterProfile.findOne({
      where: { user_id: userId },
    });

    if (!twitterProfile) {
      return res.status(404).json({
        status: false,
        message: "Twitter profile not found for this user",
      });
    }

    if (!twitterProfile.twitter_token || !twitterProfile.twitter_secret) {
      return res.status(400).json({
        status: false,
        message: "Twitter credentials not found for this user",
      });
    }

    await deleteTweet(
      tweetId,
      twitterProfile.twitter_token,
      twitterProfile.twitter_secret
    );

    res.json({
      status: true,
      message: `Successfully deleted Tweet ID: ${tweetId}`,
    });
  } catch (error) {
    console.error("Delete tweet error:", error);
    const errorMessage =
      error.errors?.[0]?.message ||
      error.detail ||
      error.message ||
      "Failed to delete tweet";

    res.status(500).json({
      status: false,
      message: errorMessage,
      error: error.errors || error.detail || error.message,
    });
  }
};

module.exports.getUserTweets = async (req, res) => {
  try {
    const { userId } = req.body;
    const twitterProfile = await TwitterProfile.findOne({
      where: { user_id: userId },
    });

    if (!twitterProfile) {
      return res.status(404).json({
        status: false,
        message: "Twitter profile not found",
      });
    }

    const tid = twitterProfile.twitter_token.split("-")[0];

    const tweets = await getUserTweets(
      tid,
      twitterProfile.twitter_token,
      twitterProfile.twitter_secret
    );

    res.json({
      status: true,
      data: tweets,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports.deleteLinkedInPost = async (req, res) => {
  const { userId, postId } = req.body;

  try {
    const linkedinProfile = await LinkedInProfile.findOne({
      where: { user_id: userId },
    });

    if (!linkedinProfile) {
      return res.status(404).json({
        status: false,
        message: "LinkedIn profile not found for this user",
      });
    }

    if (!linkedinProfile.access_token) {
      return res.status(400).json({
        status: false,
        message: "LinkedIn credentials not found for this user",
      });
    }

    await deleteLinkedInPost(postId, linkedinProfile.access_token);

    res.json({
      status: true,
      message: `Successfully deleted LinkedIn Post ID: ${postId}`,
    });
  } catch (error) {
    console.error("Delete LinkedIn post error:", error);
    const errorMessage =
      error.errors?.[0]?.message ||
      error.detail ||
      error.message ||
      "Failed to delete LinkedIn post";

    res.status(500).json({
      status: false,
      message: errorMessage,
      error: error.errors || error.detail || error.message,
    });
  }
};

module.exports.getLinkedInPosts = async (req, res) => {
  const { userId } = req.body;

  try {
    const linkedinProfile = await LinkedInProfile.findOne({
      where: { user_id: userId },
    });

    if (!linkedinProfile) {
      return res.status(404).json({
        status: false,
        message: "LinkedIn profile not found for this user",
      });
    }

    if (!linkedinProfile.access_token) {
      return res.status(400).json({
        status: false,
        message: "LinkedIn credentials not found for this user",
      });
    }
    console.log("linkedinProfile.access_token", linkedinProfile.access_token);
    const posts = await getLinkedInPosts(linkedinProfile.access_token);

    res.json({
      status: true,
      message: "Successfully fetched LinkedIn posts",
      data: posts,
    });
  } catch (error) {
    console.error("Get LinkedIn posts error:", error);
    const errorMessage =
      error.errors?.[0]?.message ||
      error.detail ||
      error.message ||
      "Failed to fetch LinkedIn posts";

    res.status(500).json({
      status: false,
      message: errorMessage,
      error: error.errors || error.detail || error.message,
    });
  }
};

module.exports.getUserDetailsTwitter = async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required"
    });
  }

  try {
    const twitterProfile = await TwitterProfile.findOne({
      where: { user_id: userId }
    });

    if (!twitterProfile) {
      return res.status(404).json({
        success: false,
        message: "Twitter profile not found for this user"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        name: twitterProfile.name,
        screen_name: twitterProfile.screen_name,
        location: twitterProfile.location,
        description: twitterProfile.description,
        protected: twitterProfile.protected,
        followers_count: twitterProfile.followers_count,
        friends_count: twitterProfile.friends_count,
        listed_count: twitterProfile.listed_count,
        favourites_count: twitterProfile.favourites_count,
        verified: twitterProfile.verified,
        statuses_count: twitterProfile.statuses_count,
        lang: twitterProfile.lang,
        following: twitterProfile.following,
        notifications: twitterProfile.notifications,
        translator_type: twitterProfile.translator_type,
        suspended: twitterProfile.suspended,
        createdAt: twitterProfile.createdAt,
        updatedAt: twitterProfile.updatedAt
      }
    });

  } catch (error) {
    console.error("Error fetching Twitter profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching Twitter profile",
      error: error.message
    });
  }
};

module.exports.getUserDetailsLinkedin = async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required"
    });
  }

  try {
    const linkedinProfile = await LinkedInProfile.findOne({
      where: { user_id: userId }
    });

    if (!linkedinProfile) {
      return res.status(404).json({
        success: false,
        message: "LinkedIn profile not found for this user"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        name: linkedinProfile.name,
        given_name: linkedinProfile.given_name,
        family_name: linkedinProfile.family_name,
        email: linkedinProfile.email,
        email_verified: linkedinProfile.email_verified,
        picture: linkedinProfile.picture,
        country: linkedinProfile.country,
        language: linkedinProfile.language,
        sub: linkedinProfile.sub,
        createdAt: linkedinProfile.createdAt,
        updatedAt: linkedinProfile.updatedAt
      }
    });

  } catch (error) {
    console.error("Error fetching LinkedIn profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching LinkedIn profile",
      error: error.message
    });
  }
};