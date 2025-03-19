const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config");
const User = require("../models/user.model");

// Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers.authorization?.split(' ')[1];
console.log('Token:',token);
  if (!token) {
    return res.status(403).json({
      message: "No authentication token provided. Please log in to access this resource."
    });
  }

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: "Your session has expired. Please log in again.",
          expired: true
        });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: "Invalid authentication token. Please log in again.",
          invalid: true
        });
      }
      
      return res.status(401).json({
        message: "Unauthorized access. Authentication failed."
      });
    }
    
    req.userId = decoded.id;
    req.userRole = decoded.role; // Include user role in request
    next();
  });
};

// Check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: "User account not found."
      });
    }
    
    if (user.role === 'admin') {
      next();
      return;
    }

    res.status(403).json({
      message: "Access denied. Administrator privileges required for this operation."
    });
  } catch (error) {
    console.error("Role validation error:", error);
    res.status(500).json({
      message: "An error occurred while validating user permissions.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Check if user is student
const isStudent = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: "User account not found."
      });
    }
    
    if (user.role === 'student') {
      next();
      return;
    }

    res.status(403).json({
      message: "Access denied. Student privileges required for this operation."
    });
  } catch (error) {
    console.error("Role validation error:", error);
    res.status(500).json({
      message: "An error occurred while validating user permissions.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Check if user is lecturer
const isLecturer = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: "User account not found."
      });
    }
    
    if (user.role === 'lecturer') {
      next();
      return;
    }

    res.status(403).json({
      message: "Access denied. Lecturer privileges required for this operation."
    });
  } catch (error) {
    console.error("Role validation error:", error);
    res.status(500).json({
      message: "An error occurred while validating user permissions.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isStudent,
  isLecturer
};
