  // middlewares/upload.js
  const multer = require("multer");
  const path = require("path");

  // Multer storage setup
  // Multer storage setup
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/"); // Ensure this folder exists
    },
    filename: function (req, file, cb) {
      // Use the original filename
      cb(null, file.originalname);
    },
  });


  // File filter to allow only images
  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  };

  // Final upload config with filter and limits
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // max 5 MB
    },
  });

  module.exports = upload;
