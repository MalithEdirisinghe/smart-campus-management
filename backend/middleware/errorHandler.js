// middleware/errorHandler.js

module.exports = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: "File is too large. Maximum size is 5MB."
        });
      }
      return res.status(400).json({
        message: `File upload error: ${err.message}`
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({
        message: err.message || "An unknown error occurred"
      });
    }
    next();
  };