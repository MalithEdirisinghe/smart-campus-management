const { Lecturer } = require('../models'); // Sequelize model from models/index.js
const User = require('../models/user.model'); // Plain user model with findById & update methods
const db = require('../models/db');

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

// lecturer.controller.js
exports.getClasses = async (req, res) => {
  try {
    // For example, fetch all classes from 'lecturer_classes' table
    // or filter by lecturerId, etc.
    const classes = await db.query('SELECT * FROM lecturer_classes');
    res.status(200).json(classes);
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ message: "Failed to fetch classes" });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    // For example, parse query params: module, batch, date
    const { module, batch, date } = req.query;
    // Query your attendance table accordingly...
    const attendance = await db.query('SELECT * FROM attendance WHERE ...');
    res.status(200).json(attendance);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

exports.addClass = async (req, res) => {
    try {
      // Destructure expected fields from the request body
      const { batch, module, startDate, endDate, classroom } = req.body;
      
      // Adjust the table name below to match your actual table name.
      // For example, if your table is named "lecturer_classes", use that.
      const insertQuery = `
        INSERT INTO lecturer_classes (batch, module, start_date, end_date, classroom)
        VALUES (?, ?, ?, ?, ?)
      `;
      const params = [batch, module, startDate, endDate || null, classroom];
  
      // Execute the query
      await db.query(insertQuery, params);
  
      return res.status(201).json({
        batch,
        module,
        startDate,
        endDate,
        classroom,
        message: "Class added successfully!"
      });
    } catch (error) {
      console.error("Error adding class:", error);
      return res.status(500).json({
        message: "Failed to add class!",
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

exports.getStudentsByBatch = async (req, res) => {
  try {
      const { batch } = req.query;
      if (!batch) {
          return res.status(400).json({ message: "Batch parameter is required" });
      }

      const query = `
          SELECT 
              s.student_id AS studentId, 
              u.first_name AS firstName, 
              u.last_name AS lastName, 
              s.batch, 
              u.contact_number AS contact, 
              u.email
          FROM students s
          JOIN users u ON s.user_id = u.user_id
          WHERE s.batch = ?`;

      console.log("Executing SQL Query:", query, [batch]); // Debugging log

      const [students] = await db.query(query, [batch]);

      res.status(200).json(students);
  } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Approve student registration request
exports.approveStudentRegistration = async (req, res) => {
  const { requestId, lecturerId, lecturerRole } = req.body;

  try {
      // Fetch request details
      const requestQuery = `SELECT student_id, module_id FROM student_requests WHERE request_id = ?`;
      const [requestResult] = await db.query(requestQuery, [requestId]);

      if (!requestResult.length) {
          return res.status(404).json({ error: "Request not found" });
      }

      const { student_id, module_id } = requestResult[0];

      // Insert student into student_classes
      const insertClassQuery = `INSERT INTO student_classes (student_id, module_id) VALUES (?, ?)`;
      await db.query(insertClassQuery, [student_id, module_id]);

      // Update request status
      const updateRequestQuery = `UPDATE student_requests SET status = 'approved' WHERE request_id = ?`;
      await db.query(updateRequestQuery, [requestId]);

      // Send message to student
      const messageText = `Your registration request for module ${module_id} has been approved by the lecturer.`;
      const insertMessageQuery = `
          INSERT INTO messages (sender_id, sender_role, receiver_id, receiver_role, message, is_read) 
          VALUES (?, ?, ?, 'student', ?, 0)`;
      await db.query(insertMessageQuery, [lecturerId, lecturerRole, student_id, messageText]);

      res.json({ success: true, message: "Student registered successfully!" });
  } catch (error) {
      res.status(500).json({ error: "Failed to approve registration" });
  }
};
exports.approveStudentRegistration = async (req, res) => {
  const { requestId, lecturerId, lecturerRole } = req.body;

  try {
      // Fetch request details
      const requestQuery = `SELECT student_id, module_id FROM student_requests WHERE request_id = ?`;
      const [requestResult] = await db.query(requestQuery, [requestId]);

      if (!requestResult.length) {
          return res.status(404).json({ error: "Request not found" });
      }

      const { student_id, module_id } = requestResult[0];

      // Insert student into student_classes
      const insertClassQuery = `INSERT INTO student_classes (student_id, module_id) VALUES (?, ?)`;
      await db.query(insertClassQuery, [student_id, module_id]);

      // Update request status
      const updateRequestQuery = `UPDATE student_requests SET status = 'approved' WHERE request_id = ?`;
      await db.query(updateRequestQuery, [requestId]);

      // Send message to student
      const messageText = `Your registration request for module ${module_id} has been approved by the lecturer.`;
      const insertMessageQuery = `
          INSERT INTO messages (sender_id, sender_role, receiver_id, receiver_role, message, is_read) 
          VALUES (?, ?, ?, 'student', ?, 0)`;
      await db.query(insertMessageQuery, [lecturerId, lecturerRole, student_id, messageText]);

      res.json({ success: true, message: "Student registered successfully!" });
  } catch (error) {
      res.status(500).json({ error: "Failed to approve registration" });
  }
};
