const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../services/storageService');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Endpoint for Editor.js image uploads
 * Editor.js expects a specific response format:
 * {
 *   "success": 1,
 *   "file": {
 *     "url": "https://..."
 *   }
 * }
 */
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: 0, message: 'No file uploaded' });
    }

    const imageUrl = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    console.log(`[Upload] Image successfully uploaded to: ${imageUrl}`);

    res.json({
      success: 1,
      file: {
        url: imageUrl,
      },
    });
  } catch (error) {
    console.error('Upload route error:', error.message);
    res.status(500).json({
      success: 0,
      message: 'Failed to upload image. Please check bucket configuration.',
      error: error.message,
    });
  }
});

module.exports = router;
