const multer = require("multer");
const path = require("path");

// Configure storage to use memory storage for BLOB implementation
const storage = multer.memoryStorage();

// Allowed file types for assignments
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|zip/; // ✅ Supports images, PDFs, DOCX, ZIP files
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }

  cb(new Error("File upload only supports images (jpeg, jpg, png, gif), PDFs, DOCX, and ZIP files"));
};

// Configure multer
const upload = multer({
  storage: storage, // ✅ Using memory storage for database BLOB implementation
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;
