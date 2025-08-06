require("dotenv").config();
const TwitterProfile = require("../models/TwitterProfile.js");
const LinkedInProfile = require("../models/LinkedProfile.js");
const TwitterPosts = require("../models/TwitterPosts.js");
const LinkedInPosts = require("../models/LinkedInPosts.js");
const {
  executePosts,
  deleteTweet,
  getUserTweets,
  deleteLinkedInPost,
  getLinkedInPosts,
} = require("./services.js");
const fs = require("fs");
const path = require("path");

const cleanupFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    } catch (err) {
      console.error(`Error cleaning up file ${filePath}:`, err);
    }
  }
};

const validateMediaFiles = (files, platforms) => {
  const errors = [];
  const validFiles = [];
  const platformLimits = {
    twitter: {
      image: {
        maxSize: 5 * 1024 * 1024, // 5MB
        types: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      },
      video: {
        maxSize: 50 * 1024 * 1024, // 50MB
        types: ["video/mp4"],
      },
      maxFiles: 4,
    },
    linkedin: {
      image: {
        maxSize: 10 * 1024 * 1024, // LinkedIn allows 10MB for images
        types: ["image/jpeg", "image/png"],
      },
      video: {
        maxSize: 200 * 1024 * 1024, // 200MB for videos
        types: ["video/mp4"],
      },
      maxFiles: 10, // BYPASSED: Increased from 1 to allow multiple images
    },
  };

  // Ensure files is always an array
  const filesArray = Array.isArray(files) ? files : [files];

  // Check if trying to post video to both platforms
  const hasVideo = filesArray.some(
    (file) => file.mimetype && file.mimetype.startsWith("video/")
  );
  // if (hasVideo && platforms.twitter && platforms.linkedin) {
  //   errors.push("Cannot upload videos to both Twitter and LinkedIn simultaneously");
  // }

  // Validate each file for each platform
  filesArray.forEach((file, index) => {
    const fileErrors = [];

    if (platforms.twitter) {
      if (index >= platformLimits.twitter.maxFiles) {
        fileErrors.push(
          `Twitter only allows ${platformLimits.twitter.maxFiles} files per post`
        );
      } else {
        if (file.mimetype && file.mimetype.startsWith("image/")) {
          if (!platformLimits.twitter.image.types.includes(file.mimetype)) {
            fileErrors.push(`Twitter doesn't support ${file.mimetype} images`);
          }
          if (file.size > platformLimits.twitter.image.maxSize) {
            fileErrors.push(
              `Twitter image exceeds ${
                platformLimits.twitter.image.maxSize / 1024 / 1024
              }MB limit`
            );
          }
        } else if (file.mimetype && file.mimetype.startsWith("video/")) {
          if (!platformLimits.twitter.video.types.includes(file.mimetype)) {
            fileErrors.push(`Twitter doesn't support ${file.mimetype} videos`);
          }
          if (file.size > platformLimits.twitter.video.maxSize) {
            fileErrors.push(
              `Twitter video exceeds ${
                platformLimits.twitter.video.maxSize / 1024 / 1024
              }MB limit`
            );
          }
        } else {
          fileErrors.push(
            `Twitter doesn't support ${file.mimetype || "unknown"} files`
          );
        }
      }
    }

    if (platforms.linkedin) {
      // BYPASSED: Removed the maxFiles check for LinkedIn images
      // if (index >= platformLimits.linkedin.maxFiles) {
      //   fileErrors.push(
      //     `LinkedIn only allows ${platformLimits.linkedin.maxFiles} file per post`
      //   );
      // } else {
        if (file.mimetype && file.mimetype.startsWith("image/")) {
          if (!platformLimits.linkedin.image.types.includes(file.mimetype)) {
            fileErrors.push(`LinkedIn doesn't support ${file.mimetype} images`);
          }
          if (file.size > platformLimits.linkedin.image.maxSize) {
            fileErrors.push(
              `LinkedIn image exceeds ${
                platformLimits.linkedin.image.maxSize / 1024 / 1024
              }MB limit`
            );
          }
        } else if (file.mimetype && file.mimetype.startsWith("video/")) {
          // Keep video restriction for LinkedIn (still only 1 video allowed)
          if (index >= 1) {
            fileErrors.push("LinkedIn only allows 1 video per post");
          } else {
            if (!platformLimits.linkedin.video.types.includes(file.mimetype)) {
              fileErrors.push(`LinkedIn doesn't support ${file.mimetype} videos`);
            }
            if (file.size > platformLimits.linkedin.video.maxSize) {
              fileErrors.push(
                `LinkedIn video exceeds ${
                  platformLimits.linkedin.video.maxSize / 1024 / 1024
                }MB limit`
              );
            }
          }
        } else {
          fileErrors.push(
            `LinkedIn doesn't support ${file.mimetype || "unknown"} files`
          );
        }
      // }
    }

    if (fileErrors.length === 0) {
      validFiles.push(file);
    } else {
      errors.push({
        file: file.originalname || file.name || "unknown",
        errors: fileErrors,
      });
    }
  });

  return {
    valid: errors.length === 0,
    validFiles,
    errors: errors.length > 0 ? errors : undefined,
  };
};

module.exports.postAll = async (req, res) => {
  const mediaFiles = req.files || [];

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

    // Log request details for debugging
    console.log("Post request received:", {
      userId,
      postToTwitter,
      postToLinkedIn,
      mediaFilesCount: mediaFiles.length,
      mediaTypes: mediaFiles.map((file) => file.mimetype),
    });

    // Validate required fields
    if (!userId) {
      mediaFiles.forEach((file) => cleanupFile(file.path));
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!content) {
      mediaFiles.forEach((file) => cleanupFile(file.path));
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    // Check if at least one platform is selected
    if (postToTwitter !== "true" && postToLinkedIn !== "true") {
      mediaFiles.forEach((file) => cleanupFile(file.path));
      return res.status(400).json({
        success: false,
        message: "At least one platform (Twitter or LinkedIn) must be selected",
      });
    }

    // Validate media files for selected platforms
    if (mediaFiles.length > 0) {
      const validation = validateMediaFiles(mediaFiles, {
        twitter: postToTwitter === "true",
        linkedin: postToLinkedIn === "true",
      });

      if (!validation.valid) {
        mediaFiles.forEach((f) => cleanupFile(f.path));
        return res.status(400).json({
          success: false,
          message: "Media file validation failed",
          errors: validation.errors,
        });
      }

      // Additional validation for Twitter (max 4 images, 1 video)
      if (postToTwitter === "true") {
        const twitterVideos = mediaFiles.filter(
          (file) => file.mimetype && file.mimetype.startsWith("video/")
        );

        if (twitterVideos.length > 1) {
          mediaFiles.forEach((f) => cleanupFile(f.path));
          return res.status(400).json({
            success: false,
            message: "Twitter only allows one video per post",
          });
        }

        if (twitterVideos.length === 1 && mediaFiles.length > 1) {
          mediaFiles.forEach((f) => cleanupFile(f.path));
          return res.status(400).json({
            success: false,
            message: "Twitter doesn't allow mixing videos with other media",
          });
        }
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
      mediaFiles.forEach((file) => cleanupFile(file.path));
      return res.status(400).json({
        success: false,
        message:
          "Twitter account not found. Please connect your Twitter account",
      });
    }

    if (postToLinkedIn === "true" && !linkedinUser) {
      mediaFiles.forEach((file) => cleanupFile(file.path));
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

    // Execute posts
    const PostResponse = await executePosts(
      twitterUser?.twitter_token,
      twitterUser?.twitter_secret,
      linkedinUser?.access_token,
      postContent,
      mediaFiles,
      linkedinUser?.sub
    );

    // Save to database
    if (postToTwitter === "true" && PostResponse?.twitter?.data) {
      const now = new Date();
      await TwitterPosts.create({
        user_id: userId,
        twitter_post_id: PostResponse.twitter.data.id,
        content: PostResponse.twitter.data.text,
        post_created_at: now,
        created_at: now,
        updated_at: now,
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
        updated_at: now,
      });
    }

    // Cleanup files
    mediaFiles.forEach((file) => cleanupFile(file.path));

    return res.status(200).json({
      success: true,
      message: "Post operation completed successfully",
      data: PostResponse,
    });
  } catch (error) {
    console.error("Error in postAll:", error);

    // Cleanup all files in case of error
    mediaFiles.forEach((file) => cleanupFile(file.path));

    let statusCode = 500;
    let message = "An error occurred while processing your post";

    if (error.message?.includes("Media validation failed")) {
      statusCode = 400;
      message = error.message;
    } else if (error.message?.includes("Media upload failed")) {
      statusCode = 400;
      message = "Media upload failed. Please check your files and try again.";
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
      message: "User ID is required",
    });
  }

  try {
    const twitterProfile = await TwitterProfile.findOne({
      where: { user_id: userId },
    });

    if (!twitterProfile) {
      return res.status(404).json({
        success: false,
        message: "Twitter profile not found for this user",
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
        updatedAt: twitterProfile.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching Twitter profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching Twitter profile",
      error: error.message,
    });
  }
};

module.exports.getUserDetailsLinkedin = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    const linkedinProfile = await LinkedInProfile.findOne({
      where: { user_id: userId },
    });

    if (!linkedinProfile) {
      return res.status(404).json({
        success: false,
        message: "LinkedIn profile not found for this user",
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
        updatedAt: linkedinProfile.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching LinkedIn profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching LinkedIn profile",
      error: error.message,
    });
  }
};
