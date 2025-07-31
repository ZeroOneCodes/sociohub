require("dotenv").config();
const { postTwitter, postLinkedIn } = require("./helperFunctions");
const { connectQueue } = require("../queues/worker");
const { oauthInstance } = require("../auth/oauth");
const fs = require("fs");

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
      scheduleTime,
    } = postContent;

    // Immediate posting logic
    if (isScheduled !== "true") {
      if (postToTwitter === "true") {
        twitterResponse = await postTwitter(
          { twittertoken, twittertokenSecret },
          content,
          mediaFile
        );
      }

      if (postToLinkedIn === "true") {
        const tags = rawTags ? JSON.parse(rawTags) : [];
        const isDraft = publishStatus === "draft";

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
        message: "Post successful",
        twitter: twitterResponse,
        linkedIn: linkedInResponse,
      };
    }
    // Scheduling logic
    else {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);

      if (scheduledDateTime <= new Date()) {
        throw new Error("Scheduled time must be in the future");
      }

      // Save media file to a permanent location if it exists
      let mediaPath = null;
      if (mediaFile) {
        const permanentPath = `scheduled_media/${Date.now()}_${
          mediaFile.originalname
        }`;
        fs.mkdirSync("scheduled_media", { recursive: true });
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
          twitter:
            postToTwitter === "true"
              ? {
                  twittertoken,
                  twittertokenSecret,
                }
              : null,
          linkedin:
            postToLinkedIn === "true"
              ? {
                  linkedinAccessToken: linkedAccesToken,
                  linkedinId,
                }
              : null,
        },
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
        scheduledTime: scheduledDateTime,
      };
    }
  } catch (error) {
    console.error("Error in combined posting:", error);

    // Clean up media file in case of error
    if (mediaFile && fs.existsSync(mediaFile.path)) {
      fs.unlinkSync(mediaFile.path);
    }

    throw {
      error: "An error occurred while posting",
      details: error.message,
    };
  }
};

async function deleteTweet(tweetId, twitterToken, twitterTokenSecret) {
  const url = `https://api.twitter.com/2/tweets/${tweetId}`;

  try {
    const requestData = {
      url,
      method: "DELETE",
    };

    const token = {
      key: twitterToken,
      secret: twitterTokenSecret,
    };

    const authHeaders = oauthInstance.toHeader(
      oauthInstance.authorize(requestData, token)
    );
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const responseData = await response.json();

    if (response.status === 200 && responseData?.data?.deleted === true) {
      return {
        success: true,
        message: "Tweet deleted successfully",
        data: responseData,
      };
    }
    if (response.status === 204) {
      return {
        success: true,
        message: "Tweet deleted successfully (no content)",
      };
    }
    const errorMessage =
      responseData.detail ||
      responseData.title ||
      `Twitter API error: ${response.status} ${response.statusText}`;

    console.error("Twitter API error:", errorMessage);
    throw new Error(errorMessage);
  } catch (error) {
    console.error("Error in deleteTweet:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

async function getUserTweets(userId, twitterToken, twitterTokenSecret) {
  const url = `https://api.twitter.com/2/users/${userId}/tweets?max_results=100&tweet.fields=created_at,public_metrics&expansions=author_id`;

  const authHeaders = oauthInstance.toHeader(
    oauthInstance.authorize(
      { url, method: "GET" },
      { key: twitterToken, secret: twitterTokenSecret }
    )
  );

  const response = await fetch(url, {
    headers: authHeaders,
  });

  return response.json();
}

async function deleteLinkedInPost(postId, accessToken) {
  const linkedinUrn = `urn:li:share:${postId}`;
  const url = `https://api.linkedin.com/v2/ugcPosts/${encodeURIComponent(
    linkedinUrn
  )}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (response.status === 204) {
      return {
        success: true,
        message: "LinkedIn post deleted successfully",
      };
    }

    const responseData = await response.json();
    const errorMessage =
      responseData.message ||
      `LinkedIn API error: ${response.status} ${response.statusText}`;

    console.error("LinkedIn API error:", errorMessage);
    throw new Error(errorMessage);
  } catch (error) {
    console.error("Error in deleteLinkedInPost:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

async function getLinkedInPosts(accessToken) {
  try {
    console.log("=== Starting LinkedIn API calls ===");
    console.log(
      "Access token (first 20 chars):",
      accessToken.substring(0, 20) + "..."
    );

    // Step 1: Get user profile with simple endpoint
    console.log("Step 1: Fetching LinkedIn profile...");
    const profileUrl = "https://api.linkedin.com/v2/people/~";

    const profileResponse = await fetch(profileUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    if (!profileResponse.ok) {
      const errorBody = await profileResponse.text();
      console.error("LinkedIn profile fetch failed:", {
        status: profileResponse.status,
        statusText: profileResponse.statusText,
        body: errorBody,
      });
      throw new Error(
        `LinkedIn profile API error: ${profileResponse.status} ${profileResponse.statusText} - ${errorBody}`
      );
    }

    const profileData = await profileResponse.json();
    console.log("Profile data received:", JSON.stringify(profileData, null, 2));

    if (!profileData.id) {
      throw new Error("No user ID found in profile response");
    }

    const personId = profileData.id;
    console.log("Person ID:", personId);

    // Step 2: Try different approaches to get posts
    console.log("Step 2: Attempting to fetch posts...");

    // Approach 1: UGC Posts with correct syntax
    try {
      const ugcUrl = "https://api.linkedin.com/v2/ugcPosts";
      const ugcParams = new URLSearchParams({
        q: "authors",
        authors: `urn:li:person:${personId}`,
        count: "20",
      });

      console.log(
        "Trying UGC Posts with URL:",
        `${ugcUrl}?${ugcParams.toString()}`
      );

      const ugcResponse = await fetch(`${ugcUrl}?${ugcParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      });

      if (ugcResponse.ok) {
        const ugcData = await ugcResponse.json();
        console.log("UGC Posts successful:", JSON.stringify(ugcData, null, 2));

        if (ugcData.elements && ugcData.elements.length > 0) {
          return ugcData.elements.map((post) => ({
            id: post.id,
            urn: post.urn || null,
            text: extractPostText(post),
            created: post.created?.time || null,
            lastModified: post.lastModified?.time || null,
            visibility:
              post.visibility?.["com.linkedin.ugc.MemberNetworkVisibility"] ||
              "UNKNOWN",
            lifecycleState: post.lifecycleState || null,
            author: post.author || null,
            media: extractMediaInfo(post),
          }));
        } else {
          console.log("UGC Posts returned empty elements array");
        }
      } else {
        const ugcError = await ugcResponse.text();
        console.log("UGC Posts failed:", {
          status: ugcResponse.status,
          statusText: ugcResponse.statusText,
          error: ugcError,
        });
      }
    } catch (ugcError) {
      console.log("UGC Posts approach failed:", ugcError.message);
    }

    // Approach 2: Shares API (fallback)
    try {
      console.log("Trying Shares API as fallback...");
      const sharesUrl = "https://api.linkedin.com/v2/shares";
      const sharesParams = new URLSearchParams({
        q: "owners",
        owners: `urn:li:person:${personId}`,
        count: "20",
      });

      console.log(
        "Trying Shares with URL:",
        `${sharesUrl}?${sharesParams.toString()}`
      );

      const sharesResponse = await fetch(
        `${sharesUrl}?${sharesParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );

      if (sharesResponse.ok) {
        const sharesData = await sharesResponse.json();
        console.log(
          "Shares API successful:",
          JSON.stringify(sharesData, null, 2)
        );

        if (sharesData.elements && sharesData.elements.length > 0) {
          return sharesData.elements.map((share) => ({
            id: share.id,
            urn: share.urn || null,
            text: share.text?.text || "",
            created: share.created?.time || null,
            lastModified: share.lastModified?.time || null,
            visibility: share.visibility?.code || "UNKNOWN",
            owner: share.owner || null,
            content: share.content || null,
          }));
        } else {
          console.log("Shares API returned empty elements array");
        }
      } else {
        const sharesError = await sharesResponse.text();
        console.log("Shares API failed:", {
          status: sharesResponse.status,
          statusText: sharesResponse.statusText,
          error: sharesError,
        });
      }
    } catch (sharesError) {
      console.log("Shares API approach failed:", sharesError.message);
    }

    // If both approaches fail, return empty array
    console.log("Both UGC Posts and Shares API failed or returned no data");
    return [];
  } catch (error) {
    console.error("Detailed LinkedIn API error:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

// Helper function to extract post text from UGC post
function extractPostText(post) {
  try {
    const shareContent =
      post.specificContent?.["com.linkedin.ugc.ShareContent"];
    if (shareContent?.shareCommentary?.text) {
      return shareContent.shareCommentary.text;
    }

    // Try alternative text locations
    if (
      shareContent?.shareMediaCategory === "ARTICLE" &&
      shareContent.media?.[0]?.title?.text
    ) {
      return shareContent.media[0].title.text;
    }

    return "";
  } catch (e) {
    console.log("Error extracting post text:", e.message);
    return "";
  }
}

// Helper function to extract media info from UGC post
function extractMediaInfo(post) {
  try {
    const shareContent =
      post.specificContent?.["com.linkedin.ugc.ShareContent"];
    return shareContent?.media || [];
  } catch (e) {
    console.log("Error extracting media info:", e.message);
    return [];
  }
}

module.exports = {
  executePosts,
  deleteTweet,
  getUserTweets,
  deleteLinkedInPost,
  getLinkedInPosts,
};
