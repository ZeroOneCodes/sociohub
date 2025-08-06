require("dotenv").config();
const axios = require("axios");
const { oauthInstance } = require("../auth/oauth");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const getMediaCategory = (mimetype, filePath) => {
  if (!mimetype && filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimetypeMap = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".mp4": "video/mp4",
      ".mov": "video/quicktime",
      ".avi": "video/x-msvideo",
    };
    mimetype = mimetypeMap[ext];
  }

  if (!mimetype || typeof mimetype !== "string") {
    return null;
  }

  if (mimetype.startsWith("image/")) {
    return "tweet_image";
  } else if (mimetype.startsWith("video/")) {
    return "tweet_video";
  }
  return null;
};

const validateTwitterMedia = (mediaFile) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedVideoTypes = ["video/mp4", "video/mov", "video/avi"];
  const maxImageSize = 5 * 1024 * 1024;
  const maxVideoSize = 512 * 1024 * 1024;

  if (!mediaFile) {
    return { valid: false, error: "No media file provided" };
  }

  if (!mediaFile.path) {
    return { valid: false, error: "Media file path is missing" };
  }

  if (!fs.existsSync(mediaFile.path)) {
    return {
      valid: false,
      error: "Media file does not exist at path: " + mediaFile.path,
    };
  }

  let mimetype = mediaFile.mimetype;

  if (!mimetype) {
    const ext = path
      .extname(mediaFile.path || mediaFile.originalname || "")
      .toLowerCase();
    const mimetypeMap = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".mp4": "video/mp4",
      ".mov": "video/quicktime",
      ".avi": "video/x-msvideo",
    };
    mimetype = mimetypeMap[ext];

    if (!mimetype) {
      return {
        valid: false,
        error: `Cannot determine media type from file extension: ${ext}`,
      };
    }

    console.log(`Determined mimetype from extension: ${mimetype}`);
  }

  if (typeof mimetype !== "string") {
    return {
      valid: false,
      error: `Invalid mimetype format: ${typeof mimetype}`,
    };
  }

  const fileSize = fs.statSync(mediaFile.path).size;

  if (mimetype.startsWith("image/")) {
    if (!allowedImageTypes.includes(mimetype)) {
      return { valid: false, error: `Unsupported image type: ${mimetype}` };
    }
    if (fileSize > maxImageSize) {
      return { valid: false, error: "Image file too large (max 5MB)" };
    }
  } else if (mimetype.startsWith("video/")) {
    if (!allowedVideoTypes.includes(mimetype)) {
      return { valid: false, error: `Unsupported video type: ${mimetype}` };
    }
    if (fileSize > maxVideoSize) {
      return { valid: false, error: "Video file too large (max 512MB)" };
    }
  } else {
    return { valid: false, error: `Unsupported media type: ${mimetype}` };
  }

  return { valid: true };
};

const uploadMediaChunked = async (
  mediaFile,
  authToken,
  mediaCategory,
  mimetype
) => {
  const mediaUploadUrl =
    process.env.TWITTER_MEDIA_UPLOAD_URL ||
    "https://upload.twitter.com/1.1/media/upload.json";
  const fileSize = fs.statSync(mediaFile.path).size;

  // Increased chunk size for faster uploads (10MB instead of 5MB)
  const chunkSize = 10 * 1024 * 1024;

  console.log("Starting chunked upload - INIT phase");
  const initHeaders = oauthInstance.toHeader(
    oauthInstance.authorize({ url: mediaUploadUrl, method: "POST" }, authToken)
  );

  const initData = new FormData();
  initData.append("command", "INIT");
  initData.append("total_bytes", fileSize.toString());
  initData.append("media_type", mimetype || mediaFile.mimetype || "video/mp4");
  initData.append("media_category", mediaCategory);

  const initResponse = await axios.post(mediaUploadUrl, initData, {
    headers: { ...initHeaders, ...initData.getHeaders() },
    timeout: 30000, // Reduced timeout for faster failure detection
  });

  const mediaId = initResponse.data.media_id_string;
  console.log(`INIT successful. Media ID: ${mediaId}`);

  // Read file once and keep in memory for faster chunk access
  const fileBuffer = fs.readFileSync(mediaFile.path);
  const totalChunks = Math.ceil(fileSize / chunkSize);

  // Create chunk upload promises for parallel processing
  const chunkPromises = [];

  for (let i = 0; i < fileSize; i += chunkSize) {
    const segmentIndex = Math.floor(i / chunkSize);
    const chunk = fileBuffer.slice(i, Math.min(i + chunkSize, fileSize));

    // Create promise for each chunk upload
    const chunkPromise = uploadChunk(
      mediaUploadUrl,
      authToken,
      mediaId,
      segmentIndex,
      chunk
    );

    chunkPromises.push(chunkPromise);
  }

  console.log(`Uploading ${totalChunks} chunks in parallel...`);

  // Upload chunks in parallel with concurrency limit
  const concurrencyLimit = 3; // Adjust based on API limits
  await uploadChunksWithConcurrency(chunkPromises, concurrencyLimit);

  console.log("All chunks uploaded successfully");

  // FINALIZE phase
  console.log("Starting FINALIZE phase");
  const finalizeHeaders = oauthInstance.toHeader(
    oauthInstance.authorize({ url: mediaUploadUrl, method: "POST" }, authToken)
  );

  const finalizeData = new FormData();
  finalizeData.append("command", "FINALIZE");
  finalizeData.append("media_id", mediaId);

  const finalizeResponse = await axios.post(mediaUploadUrl, finalizeData, {
    headers: { ...finalizeHeaders, ...finalizeData.getHeaders() },
    timeout: 30000,
  });

  if (finalizeResponse.data.processing_info) {
    console.log("Video processing required, checking status...");
    await waitForProcessing(mediaId, authToken);
  }

  console.log("Media upload completed successfully");
  return mediaId;
};

// Helper function to upload individual chunks
const uploadChunk = async (
  mediaUploadUrl,
  authToken,
  mediaId,
  segmentIndex,
  chunk
) => {
  const appendHeaders = oauthInstance.toHeader(
    oauthInstance.authorize({ url: mediaUploadUrl, method: "POST" }, authToken)
  );

  const appendData = new FormData();
  appendData.append("command", "APPEND");
  appendData.append("media_id", mediaId);
  appendData.append("segment_index", segmentIndex.toString());
  appendData.append("media", chunk, { filename: `chunk_${segmentIndex}` });

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await axios.post(mediaUploadUrl, appendData, {
        headers: { ...appendHeaders, ...appendData.getHeaders() },
        timeout: 45000, // Increased timeout for larger chunks
        // Add compression to reduce transfer time
        decompress: true,
      });

      console.log(`Chunk ${segmentIndex + 1} uploaded successfully`);
      return;
    } catch (error) {
      attempt++;
      console.warn(
        `Chunk ${segmentIndex + 1} failed (attempt ${attempt}/${maxRetries}):`,
        error.message
      );

      if (attempt === maxRetries) {
        throw new Error(
          `Failed to upload chunk ${
            segmentIndex + 1
          } after ${maxRetries} attempts`
        );
      }

      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
};

// Helper function to manage concurrent uploads
const uploadChunksWithConcurrency = async (chunkPromises, limit) => {
  const results = [];

  for (let i = 0; i < chunkPromises.length; i += limit) {
    const batch = chunkPromises.slice(i, i + limit);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);

    // Small delay between batches to avoid overwhelming the API
    if (i + limit < chunkPromises.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
};

// Optimized processing wait function
const waitForProcessing = async (mediaId, authToken, maxAttempts = 30) => {
  const mediaUploadUrl =
    process.env.TWITTER_MEDIA_UPLOAD_URL ||
    "https://upload.twitter.com/1.1/media/upload.json";

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const statusHeaders = oauthInstance.toHeader(
      oauthInstance.authorize(
        {
          url: `${mediaUploadUrl}?command=STATUS&media_id=${mediaId}`,
          method: "GET",
        },
        authToken
      )
    );

    try {
      const statusResponse = await axios.get(
        `${mediaUploadUrl}?command=STATUS&media_id=${mediaId}`,
        {
          headers: statusHeaders,
          timeout: 15000, // Faster timeout for status checks
        }
      );

      const processingInfo = statusResponse.data.processing_info;
      console.log(
        `Processing status: ${processingInfo.state} (attempt ${
          attempt + 1
        }/${maxAttempts})`
      );

      if (processingInfo.state === "succeeded") {
        return;
      } else if (processingInfo.state === "failed") {
        throw new Error(
          `Video processing failed: ${
            processingInfo.error?.message || "Unknown error"
          }`
        );
      }

      // Dynamic wait time based on progress
      const waitTime = Math.min(processingInfo.check_after_secs || 3, 10);
      console.log(`Waiting ${waitTime} seconds before next status check...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime * 1000));
    } catch (error) {
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        console.warn(
          `Status check timeout on attempt ${attempt + 1}, retrying...`
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      throw error;
    }
  }

  throw new Error("Video processing timeout - exceeded maximum attempts");
};

// Optimized LinkedIn media upload
const optimizeLinkedInUpload = async (mediaFile, linkedinId, accessToken) => {
  const mediaType = mediaFile.mimetype.startsWith("image/") ? "IMAGE" : "VIDEO";

  console.log(
    `LinkedIn media upload - Type: ${mediaType}, File: ${
      mediaFile.originalname || "unknown"
    }, Size: ${(fs.statSync(mediaFile.path).size / (1024 * 1024)).toFixed(2)}MB`
  );

  // Register upload with longer timeout for large files
  const registerUploadResponse = await axios.post(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    {
      registerUploadRequest: {
        recipes: [
          mediaType === "IMAGE"
            ? "urn:li:digitalmediaRecipe:feedshare-image"
            : "urn:li:digitalmediaRecipe:feedshare-video",
        ],
        owner: `urn:li:person:${linkedinId}`,
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
      timeout: 30000,
    }
  );

  const uploadUrl =
    registerUploadResponse.data.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ].uploadUrl;
  const asset = registerUploadResponse.data.value.asset;

  // For large files, use streaming upload
  const fileSize = fs.statSync(mediaFile.path).size;
  const isLargeFile = fileSize > 50 * 1024 * 1024; // 50MB threshold

  if (isLargeFile) {
    console.log("Large file detected, using streaming upload...");

    // Stream upload for better memory efficiency
    const fileStream = fs.createReadStream(mediaFile.path, {
      highWaterMark: 1024 * 1024, // 1MB chunks
    });

    await axios.put(uploadUrl, fileStream, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": mediaFile.mimetype,
        "Content-Length": fileSize,
      },
      timeout: 300000, // 5 minutes for large files
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      // Enable compression
      decompress: true,
    });
  } else {
    // Standard upload for smaller files
    await axios.put(uploadUrl, fs.readFileSync(mediaFile.path), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": mediaFile.mimetype,
      },
      timeout: 120000, // 2 minutes
    });
  }

  console.log(`LinkedIn media uploaded successfully. Asset: ${asset}`);
  return { asset, mediaType };
};
module.exports.postTwitter = async (
  { twittertoken, twittertokenSecret },
  tweet,
  mediaFiles
) => {
  const authToken = { key: twittertoken, secret: twittertokenSecret };
  let mediaIds = [];

  if (mediaFiles && mediaFiles.length > 0) {
    for (const mediaFile of mediaFiles) {
      const validation = validateTwitterMedia(mediaFile);
      if (!validation.valid) {
        throw new Error(`Media validation failed: ${validation.error}`);
      }

      // Determine mimetype more reliably
      let mimetype = mediaFile.mimetype;
      if (!mimetype) {
        const ext = path
          .extname(mediaFile.path || mediaFile.originalname || "")
          .toLowerCase();
        const mimetypeMap = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".gif": "image/gif",
          ".webp": "image/webp",
          ".mp4": "video/mp4",
          ".mov": "video/quicktime",
          ".avi": "video/x-msvideo",
        };
        mimetype = mimetypeMap[ext] || "application/octet-stream";
      }

      const mediaCategory = getMediaCategory(mimetype, mediaFile.path);
      if (!mediaCategory) {
        throw new Error(`Unsupported media type: ${mimetype || "unknown"}`);
      }

      console.log(
        `Uploading media file: ${
          mediaFile.originalname || path.basename(mediaFile.path)
        }`
      );
      console.log(`Media type: ${mimetype}`);
      console.log(`Media category: ${mediaCategory}`);

      try {
        // For videos, use chunked upload
        if (mediaCategory === "tweet_video") {
          const mediaId = await uploadMediaChunked(
            mediaFile,
            authToken,
            mediaCategory,
            mimetype
          );
          mediaIds.push(mediaId);
        }
        // For images, use simple upload
        else {
          const mediaUploadUrl =
            process.env.TWITTER_MEDIA_UPLOAD_URL ||
            "https://upload.twitter.com/1.1/media/upload.json";
          const formData = new FormData();

          formData.append("media", fs.createReadStream(mediaFile.path), {
            filename: path.basename(mediaFile.path),
            contentType: mimetype,
          });

          const mediaHeaders = oauthInstance.toHeader(
            oauthInstance.authorize(
              { url: mediaUploadUrl, method: "POST" },
              authToken
            )
          );

          const uploadResponse = await axios.post(mediaUploadUrl, formData, {
            headers: { ...mediaHeaders, ...formData.getHeaders() },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60000,
          });

          mediaIds.push(uploadResponse.data.media_id_string);
        }
      } catch (error) {
        console.error(
          "Error uploading media:",
          error.response?.data || error.message
        );
        throw new Error(
          `Media upload failed: ${error.response?.data?.error || error.message}`
        );
      }
    }
  }

  // Post the tweet with media
  const tweetUrl = process.env.TWEET_URL || "https://api.twitter.com/2/tweets";
  const tweetHeaders = oauthInstance.toHeader(
    oauthInstance.authorize({ url: tweetUrl, method: "POST" }, authToken)
  );

  const tweetData = { text: tweet };
  if (mediaIds.length > 0) {
    tweetData.media = { media_ids: mediaIds };
  }

  try {
    const response = await axios.post(tweetUrl, tweetData, {
      headers: {
        ...tweetHeaders,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error posting tweet:",
      error.response?.data || error.message
    );
    throw new Error(
      `Tweet posting failed: ${
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message
      }`
    );
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
    console.log("111111111111",mediaFile)
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
        process.env.LINKEDIN_MEDIA_UPLOAD_URL ||
        "https://api.linkedin.com/v2/assets?action=registerUpload";
      const mediaType = mediaFile.mimetype.startsWith("image/")
        ? "IMAGE"
        : "VIDEO";

      console.log(
        `LinkedIn media upload - Type: ${mediaType}, File: ${
          mediaFile.originalname || "unknown"
        }`
      );

      const registerUploadResponse = await axios.post(
        "https://api.linkedin.com/v2/assets?action=registerUpload",
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
      console.log(`LinkedIn media uploaded successfully. Asset: ${asset}`);
    }

    // 4. Create the post
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

    console.log(
      "LinkedIn post request body:",
      JSON.stringify(requestBody, null, 2)
    );

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
    if (mediaFile && fs.existsSync(mediaFile.path)) {
      fs.unlinkSync(mediaFile.path);
    }

    console.log("LinkedIn post created successfully:", response.data);
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
