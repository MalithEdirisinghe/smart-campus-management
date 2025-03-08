// controllers/admin.controller.js
const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const db = require('../models/db');
const bcrypt = require('bcryptjs'); 

// Get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findByUserId(req.userId);
    
    if (!admin) {
      return res.status(404).json({
        message: "Admin profile not found!"
      });
    }
    
    // Get user data
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        message: "User not found!"
      });
    }
    
    // Enhanced debugging for profile image
    console.log("User data retrieved:", user.user_id);
    console.log("Profile image exists:", !!user.profileImage);
    console.log("Profile image type:", typeof user.profileImage);
    
    // If the profile image is a Buffer (BLOB), convert it to base64
    let profileImage = null;
    if (user.profile_image) {
      const imageType = user.profile_image_type || 'image/jpeg';
      profileImage = `data:${imageType};base64,${user.profile_image.toString('base64')}`;
      console.log("Using direct field access - image converted successfully");
    }
    try {
      if (user.profileImage) {
        if (Buffer.isBuffer(user.profileImage)) {
          const imageType = user.profileImageType || 'image/jpeg';
          profileImage = `data:${imageType};base64,${user.profileImage.toString('base64')}`;
          console.log("Successfully converted image buffer to base64");
        } else {
          console.log("Profile image is not a buffer:", typeof user.profileImage);
        }
      } else {
        console.log("No profile image found for user");
      }
    } catch (imgError) {
      console.error("Error converting profile image:", imgError);
    }
    
    // Create response object with all user data
    const responseData = {
      firstName: user.firstName || user.first_name,
      lastName: user.lastName || user.last_name,
      adminId: admin.admin_id,
      role: user.role,
      department: admin.department,
      dateOfBirth: user.dateOfBirth || user.date_of_birth,
      gender: user.gender,
      address: user.address,
      contactNumber: user.contactNumber || user.contact_number,
      email: user.email,
      profileImage: profileImage
    };
    
    // Log response details
    console.log("Response includes image:", !!profileImage);
    console.log("Response keys:", Object.keys(responseData));
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      message: "Failed to retrieve profile!",
      error: error.message
    });
  }
};

// Update admin profile
exports.updateProfile = async (req, res) => {
  try {
    // Get the admin to ensure they exist
    const admin = await Admin.findByUserId(req.userId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin profile not found!"
      });
    }

    // Prepare user data from form fields
    const userData = {
      firstName: req.body.firstName || null,
      lastName: req.body.lastName || null,
      dateOfBirth: req.body.dateOfBirth || null,
      gender: req.body.gender || null,
      address: req.body.address || null,
      contactNumber: req.body.contactNumber || null
    };

    // Handle profile image if uploaded
    if (req.file) {
      console.log("Received file in updateProfile:", req.file.originalname, "Size:", req.file.size);

      // Store the binary data and mime type
      userData.profileImage = req.file.buffer;
      userData.profileImageType = req.file.mimetype;
    }

    // Update user information in database
    await User.update(req.userId, userData);

    // If admin-specific fields were provided, update them too
    const adminData = {};
    if (req.body.department) {
      adminData.department = req.body.department;
    }

    // Update admin data if needed
    if (Object.keys(adminData).length > 0) {
      await Admin.update(admin.admin_id, adminData);
    }

    // Prepare response data
    const responseData = {
      message: "Profile updated successfully!",
      firstName: userData.firstName,
      lastName: userData.lastName,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      address: userData.address,
      contactNumber: userData.contactNumber,
      adminId: admin.admin_id,
      department: adminData.department || admin.department
    };

    // If we uploaded a new image, include it in the response as base64
    if (req.file) {
      responseData.profileImage = `data:${userData.profileImageType};base64,${userData.profileImage.toString('base64')}`;
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      message: "Failed to update profile!",
      error: error.message
    });
  }
};

// Add a new user (admin or lecturer)
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, department, role, contactNumber } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !department || !role) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }
    
    // Verify the role is allowed (only admin or lecturer)
    if (role !== 'admin' && role !== 'lecturer') {
      return res.status(400).json({
        message: "Invalid role. Only 'admin' or 'lecturer' are allowed."
      });
    }
    
    // Start a transaction
    const userData = await db.transaction(async (connection) => {
      // Check if email already exists
      const [existingUsers] = await connection.execute(
        'SELECT email FROM users WHERE email = ?',
        [email]
      );
      
      if (existingUsers.length > 0) {
        throw new Error('Email address is already in use');
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert user record
      const [userResult] = await connection.execute(
        `INSERT INTO users 
         (email, password, role, first_name, last_name, contact_number) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          email,
          hashedPassword,
          role,
          firstName,
          lastName,
          contactNumber || null
        ]
      );
      
      const userId = userResult.insertId;
      
      // Generate ID based on role
      let userTypeId;
      if (role === 'admin') {
        // Generate admin ID (e.g., A001, A002, etc.)
        userTypeId = await generateId('admin', department);
        
        // Create admin record
        await connection.execute(
          `INSERT INTO admin_users 
           (admin_id, user_id, department, access_level) 
           VALUES (?, ?, ?, ?)`,
          [
            userTypeId,
            userId,
            department,
            'admin' // Default access level
          ]
        );
      } else if (role === 'lecturer') {
        // Generate lecturer ID (e.g., L001, L002, etc.)
        userTypeId = await generateId('lecturer', department);
        
        // Create lecturer record
        await connection.execute(
          `INSERT INTO lecturer_users 
           (lecturer_id, user_id, department, specialization) 
           VALUES (?, ?, ?, ?)`,
          [
            userTypeId,
            userId,
            department,
            null // No specialization by default
          ]
        );
      }
      
      // Return the created user data
      return {
        id: userTypeId,
        userId: userId,
        role: role,
        firstName: firstName,
        lastName: lastName,
        email: email,
        department: department,
        contactNumber: contactNumber
      };
    });
    
    res.status(201).json(userData);
  } catch (error) {
    console.error('User creation error:', error);
    
    // Provide more user-friendly error messages
    if (error.message.includes('already in use')) {
      return res.status(409).json({
        message: "This email address is already registered. Please use a different email."
      });
    }
    
    res.status(500).json({
      message: "Failed to create user. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to generate IDs
async function generateId(role, department) {
  const prefix = role === 'admin' ? 'A' : 'L';
  
  // Get the latest ID for this role
  const query = `
    SELECT ${role === 'admin' ? 'admin_id' : 'lecturer_id'} as id
    FROM ${role === 'admin' ? 'admin_users' : 'lecturer_users'}
    WHERE ${role === 'admin' ? 'admin_id' : 'lecturer_id'} LIKE ?
    ORDER BY id DESC 
    LIMIT 1
  `;
  
  const results = await db.query(query, [`${prefix}%`]);
  
  if (results.length > 0) {
    const currentId = results[0].id;
    const numPart = currentId.match(/\d+$/)[0];
    const nextNum = parseInt(numPart, 10) + 1;
    return `${prefix}${nextNum.toString().padStart(3, '0')}`;
  } else {
    // First user of this role
    return `${prefix}001`;
  }
}
