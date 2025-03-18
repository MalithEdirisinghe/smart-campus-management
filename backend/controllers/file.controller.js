const db = require("../models/db"); // MySQL Database Connection

// 📌 Function: Lecturer shares a file/note with a batch & module
exports.shareFile = async (req, res) => {
    try {
        const { lecturer_id, module, batch, note } = req.body;
        const file_data = req.file ? req.file.buffer : null; // Store file as BLOB
        const file_name = req.file ? req.file.originalname : null;

        if (!lecturer_id || !module || !batch) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const query = "INSERT INTO shared_files (lecturer_id, module, batch, file_name, file_data, note) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [lecturer_id, module, batch, file_name, file_data, note];

        db.query(query, values, (err, result) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });

            res.status(201).json({ message: "File shared successfully!", sharedFileId: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// 📌 Function: Retrieve shared files for a batch/module
// exports.getSharedFiles = async (req, res) => {
//     try {
//         // Log the entire params object
//         console.log("Request params:", req.params);

//         const { module } = req.params; // Extract the module parameter

//         // Log the module parameter for debugging
//         console.log("Module parameter:", module);

//         // Check if module is undefined or empty and handle it
//         if (!module) {
//             return res.status(400).json({ error: "Module parameter is missing." });
//         }

//         const query = "SELECT file_name, file_data FROM shared_files WHERE module = ? ORDER BY created_at DESC";

//         db.query(query, [module], (err, results) => {
//             if (err) {
//                 console.error("Database query error:", err);
//                 return res.status(500).json({ error: "Database error", details: err.message });
//             }

//             // Assuming file_data is binary, convert it to base64 for JSON
//             const sharedFiles = results.map(result => ({
//                 file_name: result.file_name,
//                 file_data: result.file_data ? result.file_data.toString('base64') : null // Handle null case
//             }));

//             res.status(200).json({ sharedFiles });
//             console.log('result:', sharedFiles);
//         });
//     } catch (error) {
//         console.error("Internal server error:", error);
//         res.status(500).json({ error: "Internal Server Error", details: error.message });
//     }
// };

exports.getSharedFiles = async (req, res) => {
    try {
        console.log("Request params:", req.params);

        const { module } = req.params;
        console.log("Module parameter:", module);

        if (!module) {
            return res.status(400).json({ error: "Module parameter is missing." });
        }

        // Use the parameterized query that filters by module
        const query = "SELECT file_name, file_data FROM shared_files WHERE module = ?";

        // Pass the module parameter as an array
        db.query(query, [module], (err, results) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ error: "Database error", details: err.message });
            }

            console.log("Executing query:", query, "with parameters:", [module]);

            const sharedFiles = results.map(result => ({
                file_name: result.file_name,
                file_data: result.file_data ? result.file_data.toString('base64') : null
            }));

            console.log("Sending response with shared files:", sharedFiles);

            res.status(200).json({ sharedFiles });
        });
    } catch (error) {
        console.error("Internal server error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// 📌 Function: Download a shared file by ID
exports.downloadFile = async (req, res) => {
    try {
        const { id } = req.params;

        const query = "SELECT file_name, file_data FROM shared_files WHERE id = ?";
        db.query(query, [id], (err, results) => {
            if (err) return res.status(500).json({ error: "Database error", details: err });
            if (results.length === 0) return res.status(404).json({ error: "File not found" });

            const file = results[0];
            res.setHeader("Content-Disposition", `attachment; filename=${file.file_name}`);
            res.setHeader("Content-Type", "application/octet-stream");
            res.send(file.file_data);
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};