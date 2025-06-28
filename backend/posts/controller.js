require("dotenv").config();
const TwitterProfile = require("../models/TwitterProfile.js");
const LinkedInProfile = require("../models/LinkedProfile.js");
const { executePosts } = require("./services.js");

module.exports.postAll = async (req, res) => {
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
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  const twitterUser = await TwitterProfile.findOne({
    where: { user_id: userId },
  });
  const linkedinUser = await LinkedInProfile.findOne({
    where: { user_id: userId },
  });

  if (!twitterUser) {
    return res.status(400).json({
      success: false,
      message: "Twitter Account not found Connect your Twitter Account",
    });
  }
  if (!linkedinUser) {
    return res.status(400).json({
      success: false,
      message: "Linkedin Acount not found Connect your Linkedin Account",
    });
  }
  let postContent = {
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
  let PostResponse = await executePosts(
    twitterUser.twitter_token,
    twitterUser.twitter_secret,
    linkedinUser.access_token,
    postContent,
    mediaFile
  );
  return res.status(200).json({
    success: true,
    message: "Posts fetched successfully",
    Twitter_user: twitterUser,
    Linkedin_user: linkedinUser,
    data: PostResponse,
  });
};
