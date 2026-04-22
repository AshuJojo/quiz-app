const { Router } = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/image', upload.single('image'), uploadController.uploadImage);

module.exports = router;
