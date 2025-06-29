require("dotenv").config();
const axios = require("axios");
const { oauthInstance } = require("../auth/oauth");
const FormData = require('form-data');
const fs = require('fs');

module.exports.postTwitter = async (
  { twittertoken, twittertokenSecret },
  tweet,
  mediaFile
) => {
  const authToken = { key: twittertoken, secret: twittertokenSecret };
  let mediaId;
  if (mediaFile) {
    const mediaUploadUrl = "https://upload.twitter.com/1.1/media/upload.json";
    const mediaHeaders = oauthInstance.toHeader(
      oauthInstance.authorize(
        {
          url: mediaUploadUrl,
          method: "POST",
        },
        authToken
      )
    );

    const formData = new FormData();
    formData.append("media", fs.createReadStream(mediaFile.path));

    try {
      const uploadResponse = await axios.post(mediaUploadUrl, formData, {
        headers: {
          ...mediaHeaders,
          ...formData.getHeaders(),
        },
      });
      mediaId = uploadResponse.data.media_id_string;
    } catch (error) {
      console.error("Error uploading media:", error);
      throw error;
    }
  }

  const tweetUrl = "https://api.twitter.com/2/tweets";
  const tweetHeaders = oauthInstance.toHeader(
    oauthInstance.authorize(
      {
        url: tweetUrl,
        method: "POST",
      },
      authToken
    )
  );

  const tweetData = { text: tweet };
  if (mediaId) {
    tweetData.media = { media_ids: [mediaId] };
  }

  try {
    const response = await axios.post(tweetUrl, tweetData, {
      headers: {
        ...tweetHeaders,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error posting tweet:", error);
    throw error;
  }
};

module.exports.postLinkedIn = async (
  linkedinId,
  linkedAccesToken,
  content,
  title,
  tags,
  mediaFile,
  contentFormat,
  isDraft = false
) => {
  try {
    const linkedUserId = linkedinId;
    if (!linkedUserId) {
      throw new Error("User not found or no linkedinId");
    }
    const accessToken = linkedAccesToken;
    const hashtags = tags.map((tag) => `#${tag}`).join(" ");
    const lifecycleState = isDraft ? "DRAFT" : "PUBLISHED";
    let mediaUploadResponse;
    let shareMediaCategory = "NONE";

    if (mediaFile) {
      // Handle media upload first if a file is present
      const mediaUploadUrl =
        "https://api.linkedin.com/v2/assets?action=registerUpload";
      const mediaType = mediaFile.mimetype.startsWith("image/")
        ? "IMAGE"
        : "VIDEO";

      const registerUploadResponse = await axios.post(
        mediaUploadUrl,
        {
          registerUploadRequest: {
            recipes: [
              mediaType === "IMAGE"
                ? "urn:li:digitalmediaRecipe:feedshare-image"
                : "urn:li:digitalmediaRecipe:feedshare-video",
            ],
            owner: `urn:li:person:${linkedUserId}`,
            serviceRelationships: [
              {
                relationshipType: "OWNER",
                identifier: "urn:li:userGeneratedContent",
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const uploadUrl =
        registerUploadResponse.data.value.uploadMechanism[
          "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ].uploadUrl;
      const asset = registerUploadResponse.data.value.asset;

      // Upload the media file
      await axios.put(uploadUrl, fs.readFileSync(mediaFile.path), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": mediaFile.mimetype,
        },
      });

      shareMediaCategory = mediaType;
      mediaUploadResponse = asset;
    }

    const requestBody = {
      author: `urn:li:person:${linkedinId}`,
      lifecycleState: lifecycleState,
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: `${title}\n\n${content}\n\n${hashtags}`,
          },
          shareMediaCategory: shareMediaCategory,
          media: mediaUploadResponse
            ? [
                {
                  status: "READY",
                  description: {
                    text: title,
                  },
                  media: mediaUploadResponse,
                  title: {
                    text: title,
                  },
                },
              ]
            : undefined,
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };
    console.log("ttttt", requestBody);
    const response = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    // Clean up the uploaded file
    if (mediaFile) {
      fs.unlinkSync(mediaFile.path);
    }

    return response.data;
  } catch (error) {
    console.error(
      "Error in postLinkedIn:",
      error.response ? error.response.data : error
    );
    // Clean up the uploaded file in case of error
    if (mediaFile && fs.existsSync(mediaFile.path)) {
      fs.unlinkSync(mediaFile.path);
    }
    throw error;
  }
};