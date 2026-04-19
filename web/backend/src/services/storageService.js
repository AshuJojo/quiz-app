const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a file to Cloudflare R2
 * @param {Buffer} fileBuffer
 * @param {string} fileName
 * @param {string} mimeType
 * @returns {Promise<string>} The public URL of the uploaded file
 */
const uploadFile = async (fileBuffer, fileName, mimeType) => {
  const fileKey = `uploads/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;

  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Construct the public URL
    // Remove trailing slash from R2_PUBLIC_URL if present
    const baseUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');

    const publicUrl = baseUrl
      ? `${baseUrl}/${fileKey}`
      : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${fileKey}`;

    return publicUrl;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file to storage');
  }
};

module.exports = {
  uploadFile,
};
