const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  const allowedVideoTypes = [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
  ];

  const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

  console.log(`Uploaded file mimetype: ${file.mimetype}`);
  console.log(`Original filename: ${file.originalname}`);

  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error(
      `Unsupported file type: ${
        file.mimetype
      }. Allowed types: ${allowedTypes.join(", ")}`
    );
    error.code = "LIMIT_FILE_TYPES";
    return cb(error, false);
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".mp4",
    ".mov",
    ".avi",
    ".wmv",
  ];

  if (!allowedExtensions.includes(ext)) {
    const error = new Error(`Unsupported file extension: ${ext}`);
    error.code = "LIMIT_FILE_EXTENSION";
    return cb(error, false);
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
    fields: 10,
  },
  fileFilter: fileFilter,
});

const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 50MB.",
          error: "FILE_TOO_LARGE",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Too many files. Only one file is allowed.",
          error: "TOO_MANY_FILES",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Unexpected file field.",
          error: "UNEXPECTED_FILE",
        });
      default:
        return res.status(400).json({
          success: false,
          message: "File upload error.",
          error: error.code,
        });
    }
  } else if (error.code === "LIMIT_FILE_TYPES") {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: "INVALID_FILE_TYPE",
    });
  } else if (error.code === "LIMIT_FILE_EXTENSION") {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: "INVALID_FILE_EXTENSION",
    });
  }

  next(error);
};

module.exports = {
  upload,
  handleMulterError,
};
