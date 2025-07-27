require("dotenv").config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Configure R2 with better error handling
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  }
});

module.exports.uploadToR2 = async (file, userId) => {
  try {
    // Validate inputs
    if (!file || !file.buffer) {
      throw new Error('No file or file buffer provided');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check required environment variables
    const requiredEnvVars = [
      'CLOUDFLARE_ACCOUNT_ID',
      'R2_ACCESS_KEY_ID', 
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `uploads/${userId}/${timestamp}-${sanitizedFilename}`;

    console.log('Uploading file:', {
      originalName: file.originalname,
      sanitizedName: sanitizedFilename,
      key: key,
      size: file.buffer.length,
      mimeType: file.mimetype,
      bucket: process.env.R2_BUCKET_NAME
    });

    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Add metadata for debugging
      Metadata: {
        'uploaded-by': userId.toString(),
        'upload-timestamp': timestamp.toString(),
        'original-name': file.originalname
      }
    };

    const result = await r2.send(new PutObjectCommand(uploadParams));
    
    console.log('Upload successful:', {
      key: key,
      etag: result.ETag,
      versionId: result.VersionId
    });

    const publicUrl = `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${key}`;

    return {
      url: `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`,
      key: key
    };

  } catch (error) {
    console.error('Detailed R2 upload error:', {
      message: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      stack: error.stack
    });
    throw error;
  }
};