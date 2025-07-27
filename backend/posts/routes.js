require("dotenv").config();
const express = require("express");
const router = express.Router();
const multer = require('multer');
const PostController = require("./controller");

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for R2 upload
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (adjust as needed)
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

router.post("/post/all", upload.single('media'), PostController.postAll);

module.exports = router;