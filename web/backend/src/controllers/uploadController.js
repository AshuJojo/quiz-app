const { uploadFile } = require('../services/storageService');

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: 0, message: 'No file uploaded' });
    }

    const url = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);

    res.json({ success: 1, file: { url } });
  } catch (error) {
    next(error);
  }
};
