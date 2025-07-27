require("dotenv").config();
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

async function testR2Connection() {
  const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    }
  });

  try {
    console.log('Testing R2 connection...');
    console.log('Account ID:', process.env.CLOUDFLARE_ACCOUNT_ID);
    console.log('Endpoint:', `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`);
    
    const result = await r2.send(new ListBucketsCommand({}));
    console.log('✅ Connection successful!');
    console.log('Available buckets:', result.Buckets?.map(b => b.Name));
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    return false;
  }
}

// Run this test
testR2Connection();