const multer = require('multer');
const path = require('path');

// Configure storage to use memory storage for BLOB implementation
const storage = multer.memoryStorage();

// Check file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  
  cb(new Error('File upload only supports images (jpeg, jpg, png, gif)'));
};

// Configure multer
const upload = multer({
  storage: storage, // Using memory storage instead of disk storage
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;