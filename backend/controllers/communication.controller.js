const db = require("../models/db"); // MySQL database connection

// 📌 Function: Lecturer shares a file/note with a batch & module
exports.shareFile = async (req, res) => {
    try {
        const { lecturer_id, module, batch, note } = req.body;
        const file_path = req.file ? req.file.filename : null; // Get file path if uploaded

        const query = "INSERT INTO shared_files (lecturer_id, module, batch, file_path, note) VALUES (?, ?, ?, ?, ?)";
        const values = [lecturer_id, module, batch, file_path, note];

        db.query(query, values, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            res.status(201).json({ message: "File shared successfully!", sharedFileId: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// 📌 Function: Send a direct message between users
exports.sendMessage = async (req, res) => {
    try {
        const { sender_id, receiver_id, sender_role, receiver_role, message } = req.body;

        const query = "INSERT INTO messages (sender_id, receiver_id, sender_role, receiver_role, message) VALUES (?, ?, ?, ?, ?)";
        const values = [sender_id, receiver_id, sender_role, receiver_role, message];

        db.query(query, values, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            res.status(201).json({ message: "Message sent successfully!", messageId: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// 📌 Function: Retrieve messages for a user
exports.getUserMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        const query = "SELECT * FROM messages WHERE receiver_id = ? ORDER BY created_at DESC";
        db.query(query, [userId], (err, results) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            res.status(200).json({ messages: results });
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// 📌 Function: Retrieve shared files for a batch/module
exports.getSharedFiles = async (req, res) => {
    try {
        const { module, batch } = req.params;

        const query = "SELECT * FROM shared_files WHERE module = ? AND batch = ? ORDER BY created_at DESC";
        db.query(query, [module, batch], (err, results) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            res.status(200).json({ sharedFiles: results });
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};
