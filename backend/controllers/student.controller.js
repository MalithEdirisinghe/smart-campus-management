// controllers/student.controller.js
const User = require('../models/user.model');
const Student = require('../models/student.model');

// Get student profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findByUserId(req.userId);
    
    if (!student) {
      return res.status(404).json({
        message: "Student profile not found!"
      });
    }
    
    // If the profile image is a Buffer (BLOB), convert it to base64
    if (student.profileImage && Buffer.isBuffer(student.profileImage)) {
      const imageType = student.profileImageType || 'image/jpeg';
      student.profileImage = `data:${imageType};base64,${student.profileImage.toString('base64')}`;
      console.log("Converted BLOB image to base64 data URL");
    }
    
    res.status(200).json(student);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      message: "Failed to retrieve profile!",
      error: error.message
    });
  }
};

// Update student profile
exports.updateProfile = async (req, res) => {
  try {
    // Get the student to ensure they exist
    const student = await Student.findByUserId(req.userId);
    
    if (!student) {
      return res.status(404).json({
        message: "Student profile not found!"
      });
    }
    
    // Update user information
    const userData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      address: req.body.address,
      contactNumber: req.body.contactNumber,
      profileImage: req.body.profileImage
    };
    
    await User.update(req.userId, userData);
    
    res.status(200).json({
      message: "Profile updated successfully!"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile!",
      error: error.message
    });
  }
};

// Upload profile image as BLOB
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a file!"
      });
    }
    
    console.log("File received:", req.file.originalname, "Size:", req.file.size, "bytes");
    
    // Get the binary data from the file buffer
    const imageBuffer = req.file.buffer;
    const imageType = req.file.mimetype;
    
    // Update user profile with binary data
    await User.update(req.userId, {
      profileImage: imageBuffer,
      profileImageType: imageType
    });
    
    // Convert to base64 for immediate display in the response
    const base64Image = `data:${imageType};base64,${imageBuffer.toString('base64')}`;
    
    res.status(200).json({
      message: "Profile image uploaded successfully!",
      profileImage: base64Image
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    res.status(500).json({
      message: "Failed to upload profile image!",
      error: error.message
    });
  }
};

// New combined method to update profile with image as BLOB
exports.updateProfileWithImage = async (req, res) => {
  try {
    // Get the student to ensure they exist
    const student = await Student.findByUserId(req.userId);
    
    if (!student) {
      return res.status(404).json({
        message: "Student profile not found!"
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
      console.log("Received file in updateProfileWithImage:", req.file.originalname, "Size:", req.file.size);
      
      // Store the binary data and mime type
      userData.profileImage = req.file.buffer;
      userData.profileImageType = req.file.mimetype;
    }
    
    console.log("Updating user profile with data:", {
      ...userData,
      profileImage: userData.profileImage ? `[Binary data: ${userData.profileImage.length} bytes]` : null
    });
    
    // Update user information
    await User.update(req.userId, userData);
    
    // Prepare response data
    const responseData = {
      message: "Profile updated successfully!",
      firstName: userData.firstName,
      lastName: userData.lastName,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      address: userData.address,
      contactNumber: userData.contactNumber,
      studentId: student.studentId,
      department: student.department,
      batch: student.batch
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