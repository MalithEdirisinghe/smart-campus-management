const { Lecturer } = require('../models'); // Sequelize model from models/index.js
const User = require('../models/user.model'); // Plain user model with findById & update methods

// Helper function to process the profile image (converts BLOB to base64 if necessary)
const processProfileImage = (user) => {
  // If your DB stores the image in user.profile_image (BLOB) and type in user.profile_image_type:
  if (user.profile_image) {
    if (Buffer.isBuffer(user.profile_image)) {
      const imageType = user.profile_image_type || 'image/jpeg';
      return `data:${imageType};base64,${user.profile_image.toString('base64')}`;
    }
    // If it's not a buffer but already a string/URL, return it directly
    return user.profile_image;
  }
  return null;
};

// GET /api/lecturer/profile - Get the profile of the logged-in lecturer
exports.getProfile = async (req, res) => {
  try {
    // 1. Fetch the lecturer record from lecturer_users via Sequelize
    const lecturer = await Lecturer.findOne({
      where: { userId: req.userId },
    });
    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer profile not found!" });
    }

    // 2. Fetch common user details from the user table (using your plain User model)
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // 3. Convert BLOB (if any) to base64 for the frontend
    const profileImage = processProfileImage(user);

    // 4. Build your response object
    const responseData = {
      firstName: user.firstName || user.first_name,
      lastName: user.lastName || user.last_name,
      lecturerId: lecturer.lecturerId, // Adjust if your column is lecturer_id
      role: user.role,
      department: lecturer.department,
      dateOfBirth: user.dateOfBirth || user.date_of_birth, // Adjust if your column is date_of_birth
      gender: user.gender,
      address: user.address,
      contactNumber: user.contactNumber || user.contact_number,
      email: user.email,
      profileImage: profileImage,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Get lecturer profile error:", error);
    return res.status(500).json({
      message: "Failed to retrieve lecturer profile!",
      error: error.message,
    });
  }
};

// PUT /api/lecturer/profile/update - Update the profile of the logged-in lecturer
exports.updateProfile = async (req, res) => {
  try {
    // 1. Find the lecturer record by userId
    const lecturer = await Lecturer.findOne({ where: { userId: req.userId } });
    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer profile not found!" });
    }

    // 2. Prepare updated user data (fields in the users table)
    const userData = {
      firstName: req.body.firstName || null,
      lastName: req.body.lastName || null,
      dateOfBirth: req.body.dateOfBirth || null, // If DB column is date_of_birth, handle in User.update
      gender: req.body.gender || null,
      address: req.body.address || null,
      contactNumber: req.body.contactNumber || null,
    };

    // If a new profile image is uploaded, store it as a BLOB
    if (req.file) {
      console.log(
        "Received file for lecturer update:",
        req.file.originalname,
        "Size:",
        req.file.size
      );
      userData.profile_image = req.file.buffer; // If your DB column is profile_image
      userData.profile_image_type = req.file.mimetype; // If your DB column is profile_image_type
    }

    // 3. Update the user table record (plain model method)
    await User.update(req.userId, userData);

    // 4. Optionally update lecturer-specific fields (in lecturer_users)
    const lecturerData = {};
    if (req.body.department) {
      lecturerData.department = req.body.department;
    }
    if (Object.keys(lecturerData).length > 0) {
      // If your column is lecturer_id, or if your primary key is lecturerId
      await Lecturer.update(lecturerData, { where: { lecturerId: lecturer.lecturerId } });
    }

    // 5. Build response payload
    const updatedProfile = {
      message: "Lecturer profile updated successfully!",
      firstName: userData.firstName,
      lastName: userData.lastName,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      address: userData.address,
      contactNumber: userData.contactNumber,
      lecturerId: lecturer.lecturerId,
      department: lecturerData.department || lecturer.department,
    };

    // If we uploaded a new image, include it in the response as base64
    if (req.file) {
      updatedProfile.profileImage = `data:${
        userData.profile_image_type || "image/jpeg"
      };base64,${userData.profile_image.toString("base64")}`;
    }

    return res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Lecturer update profile error:", error);
    return res.status(500).json({
      message: "Failed to update lecturer profile!",
      error: error.message,
    });
  }
};

// Optional: GET /api/lecturer - Get a list of all lecturer users (dummy implementation)
exports.getLecturers = async (req, res) => {
  try {
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve lecturers", error: error.message });
  }
};

// Optional: GET /api/lecturer/:id - Get a lecturer's details by lecturerId (dummy implementation)
exports.getLecturerById = async (req, res) => {
  try {
    const { id } = req.params;
    res.status(200).json({ lecturerId: id, message: "Lecturer details would be here." });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve lecturer", error: error.message });
  }
};
