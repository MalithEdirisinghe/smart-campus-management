const db = require("../models/db");

exports.createAssignment = async (req, res) => {
    try {
        const { name, module, batch, releaseDate, deadline } = req.body;
        const userId = req.userId;

        const [lecturerRows] = await db.query(
            `SELECT lecturer_id FROM lecturer_users WHERE user_id = ?`, [userId]
        );

        if (!lecturerRows || !lecturerRows.lecturer_id) {
            return res.status(400).json({ message: "❌ Lecturer not found for this user_id." });
        }

        const lecturerId = lecturerRows.lecturer_id;

        // Debugging: Check if the file is present in the request
        console.log("🔍 File in request:", req.file);

        // If a file is uploaded, store its data as a BLOB
        const fileData = req.file ? req.file.buffer : null;

        const insertQuery = `
            INSERT INTO assignments (file_name, module, batch, release_date, deadline, file_data, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await db.query(insertQuery, [name, module, batch, releaseDate, deadline, fileData, lecturerId]);

        console.log("🔍 Insert Query Result:", result);

        // Assuming `result` is an object with an `insertId` property
        const insertId = result.insertId;

        res.status(201).json({ message: "Assignment created successfully!", assignmentId: insertId });
    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json({ message: "Failed to create assignment", error: error.message });
    }
};

exports.fetchStudentsByBatch = async (req, res) => {
    try {
        const { batch } = req.query;
        const query = `
            SELECT s.student_id, u.first_name, u.last_name
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.batch = ?
        `;
        const [results] = await db.query(query, [batch]);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching students by batch:", error);
        res.status(500).json({ message: "Failed to fetch students", error: error.message });
    }
};

exports.addMarks = async (req, res) => {
    try {
        const { studentId, assignmentId, marks, grade } = req.body;
        const query = `
            INSERT INTO results (student_id, assignment_id, marks, grade)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [studentId, assignmentId, marks, grade]);
        res.status(201).json({ message: "Marks added successfully!", result });
    } catch (error) {
        console.error("Error adding marks:", error);
        res.status(500).json({ message: "Failed to add marks", error: error.message });
    }
};

exports.getLatestAssignmentByModule = async (req, res) => {
    try {
        const { module } = req.query;
        if (!module) {
            return res.status(400).json({ message: "Module parameter is required" });
        }

        const query = `
            SELECT file_data, file_name
            FROM assignments
            WHERE module = ?
            ORDER BY created_at DESC
            LIMIT 1;
        `;

        const [results] = await db.query(query, [module]);

        console.log("Query results:", results); // Debugging line

        const assignment = Array.isArray(results) ? results[0] : results; // Adjust based on response format

        if (!assignment || !assignment.file_data) {
            return res.status(500).json({ message: "Unexpected database response structure" });
        }

        res.setHeader('Content-Disposition', `attachment; filename="${assignment.file_name}"`);
        res.setHeader('Content-Type', 'application/pdf'); // Adjust MIME type based on file type

        res.send(assignment.file_data);

    } catch (error) {
        console.error("Error fetching latest assignment:", error);
        res.status(500).json({ message: "Failed to fetch latest assignment", error: error.message });
    }
};

exports.submitAssignment = async (req, res) => {
    try {
        const { module, userId } = req.body;
        const fileData = req.file ? req.file.buffer : null;

        // Log values for debugging
        console.log("Received Request Body:", req.body);
        console.log("Extracted User ID:", userId);
        console.log("File Data:", fileData ? "File received" : "No file received");

        // Check for undefined values
        if (!module || !userId || !fileData) {
            return res.status(400).json({ message: "Module, user ID, and file are required" });
        }

        const insertQuery = `
            INSERT INTO submit_assignment (student_user_id, submitted_assignment, module)
            VALUES (?, ?, ?)
        `;

        const result = await db.query(insertQuery, [userId, fileData, module]);

        res.status(201).json({ message: "Assignment submitted successfully!", insertId: result.insertId });
    } catch (error) {
        console.error("Error submitting assignment:", error);
        res.status(500).json({ message: "Failed to submit assignment", error: error.message });
    }
};
