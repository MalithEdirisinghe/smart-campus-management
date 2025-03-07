const { body, validationResult } = require('express-validator');
const User = require('../models/user.model');

// Validation rules for signup
const signupValidationRules = () => {
  return [
    body('email')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    
    body('firstName')
      .notEmpty().withMessage('First name is required')
      .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
    
    body('lastName')
      .notEmpty().withMessage('Last name is required')
      .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters')
  ];
};

// Check for validation errors
const validateSignup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Check if email already exists
  try {
    const user = await User.findByEmail(req.body.email);
    if (user) {
      return res.status(400).json({
        message: "Email is already in use!"
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      message: "Unable to validate email!",
      error: error.message
    });
  }
};

module.exports = {
  signupValidationRules,
  validateSignup
};