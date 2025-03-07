const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
const db = require('../models/db');
const User = require('../models/user.model');
const Student = require('../models/student.model');

// Sign Up a new student
exports.signup = async (req, res) => {
  try {
    // Validate request data
    if (!req.body.email || !req.body.password || !req.body.firstName || !req.body.lastName) {
      return res.status(400).json({
        message: "Required fields are missing. Please provide all required information."
      });
    }

    // Start a transaction
    await db.transaction(async (connection) => {
      // Check if email already exists
      const [existingUsers] = await connection.execute(
        'SELECT email FROM users WHERE email = ?',
        [req.body.email]
      );

      if (existingUsers.length > 0) {
        throw new Error('Email address is already in use');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      
      // Create user
      const userData = {
        email: req.body.email,
        password: hashedPassword,
        role: 'student',
        firstName: req.body.firstName,
        lastName: req.body.lastName
      };
      
      // Insert user record
      const [userResult] = await connection.execute(
        `INSERT INTO users 
         (email, password, role, first_name, last_name) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          userData.email,
          userData.password,
          userData.role,
          userData.firstName,
          userData.lastName
        ]
      );
      
      const userId = userResult.insertId;
      
      // Use provided student ID or generate one
      let studentId = req.body.studentId;
      if (!studentId) {
        const department = req.body.department?.substring(0, 3).toUpperCase() || 'COM';
        studentId = await Student.generateStudentId(department);
      }
      
      // Create student record
      const studentData = {
        studentId: studentId,
        userId: userId,
        department: req.body.department || 'Computing',
        batch: req.body.batch || 'COM12',
        enrollmentDate: new Date()
      };
      
      // Insert student record
      await connection.execute(
        `INSERT INTO students 
         (student_id, user_id, department, batch, enrollment_date, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          studentData.studentId,
          studentData.userId,
          studentData.department,
          studentData.batch,
          studentData.enrollmentDate,
          'active'
        ]
      );
    });
    
    res.status(201).json({
      message: "Student registered successfully! You can now log in with your credentials."
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Provide more user-friendly error messages
    if (error.message.includes('already in use')) {
      return res.status(409).json({
        message: "This email address is already registered. Please use a different email or log in."
      });
    }
    
    res.status(500).json({
      message: "Registration failed. Please try again or contact support if the problem persists.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Sign In
exports.signin = async (req, res) => {
  try {
    // Validate request data
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }
    
    // Find user by email
    const user = await User.findByEmail(req.body.email);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found. Please check your email address."
      });
    }
    
    // Validate password
    const passwordIsValid = await bcrypt.compare(req.body.password, user.password);
    
    if (!passwordIsValid) {
      return res.status(401).json({
        message: "Invalid password. Please try again."
      });
    }
    
    // If user is a student, get student details
    let studentDetails = null;
    if (user.role === 'student') {
      studentDetails = await Student.findByUserId(user.user_id);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id }, 
      authConfig.secret, 
      { expiresIn: authConfig.jwtExpiration }
    );
    
    // Update last login time
    await User.updateLastLogin(user.user_id);
    
    // Return user information
    res.status(200).json({
      id: user.user_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      ...(studentDetails && { studentId: studentDetails.studentId }),
      ...(studentDetails && { department: studentDetails.department }),
      ...(studentDetails && { batch: studentDetails.batch }),
      accessToken: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: "An error occurred during the login process. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }
    
    // Remove sensitive information
    delete user.password;
    
    // If user is a student, get student details
    let studentDetails = null;
    if (user.role === 'student') {
      studentDetails = await Student.findByUserId(user.user_id);
    }
    
    res.status(200).json({
      ...user,
      ...(studentDetails && { studentDetails })
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      message: "Failed to retrieve user profile.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin sign in
exports.adminSignin = async (req, res) => {
  try {
    const { email, adminId, password } = req.body;
    
    // Find user by email
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    
    // Verify role is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        message: "Access denied. Administrator privileges required."
      });
    }
    
    // Verify admin ID matches using direct database query
    const adminResults = await db.query(
      'SELECT * FROM admin_users WHERE user_id = ? AND admin_id = ?',
      [user.user_id, adminId]
    );
    
    if (!adminResults || adminResults.length === 0) {
      return res.status(401).json({
        message: "Invalid Admin ID"
      });
    }
    
    // Validate password
    const passwordIsValid = await bcrypt.compare(password, user.password);
    
    if (!passwordIsValid) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id }, 
      authConfig.secret, 
      { expiresIn: authConfig.jwtExpiration }
    );
    
    // Update last login time
    await User.updateLastLogin(user.user_id);
    
    // Return admin information
    const admin = adminResults[0];
    
    res.status(200).json({
      id: user.user_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      adminId: admin.admin_id,
      department: admin.department,
      accessLevel: admin.access_level,
      accessToken: token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      message: "Failed to sign in",
      error: error.message
    });
  }
};