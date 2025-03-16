const multer = require("multer");
const path = require("path");

// ✅ Configure memory storage for handling BLOB storage in the database
const storage = multer.memoryStorage();

// ✅ Allowed file types for assignments & resource sharing
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|zip/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }

  cb(new Error("File upload only supports images (jpeg, jpg, png, gif), PDFs, DOCX, and ZIP files"));
};

// ✅ Configure Multer with memory storage for database integration
const upload = multer({
  storage: storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ 5MB limit
  fileFilter: fileFilter
});

// ✅ Export the middleware
module.exports = upload;
