const db = require("../models/db");
const SubmitAssignment = db.submitAssignment;

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

exports.getSubmittedAssignments = async (req, res) => {
    try {
        const { batch, module } = req.query;

        if (!batch || !module) {
            return res.status(400).json({ error: 'Batch and module are required' });
        }

        const query = `
            SELECT * FROM submit_assignment 
            WHERE batch = ? AND module = ?
        `;
        
        const [results] = await db.query(query, [batch, module]);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching submitted assignments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.downloadSubmittedAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Assignment ID is required" });
        }

        const query = `SELECT file_name, submitted_assignment FROM submit_assignment WHERE submitted_id = ?`;
        const [results] = await db.query(query, [id]);

        if (!results.length) {
            return res.status(404).json({ message: "File not found" });
        }

        const assignment = results[0];

        res.setHeader('Content-Disposition', `attachment; filename="${assignment.file_name}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        res.send(assignment.submitted_assignment);
    } catch (error) {
        console.error("Error downloading assignment:", error);
        res.status(500).json({ message: "Failed to download file", error: error.message });
    }
};

exports.addMarks = async (req, res) => {
    try {
        const { id, marks, grade } = req.body;  // Ensure 'id' is the primary key

        // Validate input parameters
        if (!id || marks === undefined || grade === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        console.log("📤 Updating Marks Data:", { id, marks, grade });

        // Correct SQL Query (Updating by 'id' instead of 'student_id')
        const sql = `
            UPDATE submit_assignment
            SET marks = ?, grade = ?
            WHERE id = ?;
        `;

        const values = [Number(marks), grade, id]; // Ensure 'marks' is a number
        console.log("Results:", values);

        // Execute query
        const result = await db.query(sql, values);
        console.log("Query Result:", result); // Log the result to inspect its structure

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No record updated. Check ID." });
        }

        res.status(200).json({ message: "Marks updated successfully", result });

    } catch (error) {
        console.error("❌ Error updating marks:", error);
        res.status(500).json({ message: "Internal server error", error });
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
        const { module, studentId, userId } = req.body;
        const fileData = req.file ? req.file.buffer : null;

        console.log("🔍 Received Submission Request:", { studentId, module, file: !!fileData });

        if (!studentId || !module || !fileData || !userId) {
            return res.status(400).json({ message: "❌ Student ID, module, and file are required" });
        }

        // Fetch student's batch
        const [studentRows] = await db.query("SELECT batch FROM students WHERE student_id = ?", [studentId]);

        console.log("🔍 Student Query Result:", studentRows); // Debugging

        // Check if studentRows is an object and has the batch property
        if (!studentRows.batch) {
            console.error("❌ No batch found for student:", studentId);
            return res.status(404).json({ message: "❌ Student batch not found for this student ID." });
        }

        const batch = studentRows.batch; // Access batch directly

        const[userRows] = await db.query("SELECT first_name, last_name FROM users WHERE user_id = ?", [userId])

        const first_name = userRows.first_name;
        const last_name = userRows.last_name;

        // Insert assignment into `submit_assignment` table
        const insertQuery = `
            INSERT INTO submit_assignment (student_user_id, first_name, last_name, submitted_assignment, module, batch, submitted_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

        const result = await db.query(insertQuery, [studentId, first_name, last_name, fileData, module, batch]);

        // Handle the result based on your DB adapter's return format
        const insertId = result[0]?.insertId || result.insertId;

        console.log("✅ Assignment submitted successfully:", result);

        res.status(201).json({ message: "✅ Assignment submitted successfully!", insertId });

    } catch (error) {
        console.error("❌ Error submitting assignment:", error);
        res.status(500).json({ message: "Failed to submit assignment", error: error.message });
    }
};
