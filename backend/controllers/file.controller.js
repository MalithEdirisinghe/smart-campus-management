const db = require("../models/db"); // MySQL Database Connection
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 📌 Function: Lecturer shares a file/note with a batch & module
exports.shareFile = async (req, res) => {
    let responseSent = false;

    const sendResponse = (statusCode, data) => {
        if (!responseSent && !res.headersSent) {
            responseSent = true;
            res.status(statusCode).json(data);
        }
    };

    try {
        console.log("📂 shareFile function started");

        const { lecturer_id, module, batch, note } = req.body;

        if (!lecturer_id || !module || !batch) {
            return sendResponse(400, { error: "Missing required fields." });
        }

        if (!req.file) {
            return sendResponse(400, { error: "File upload required." });
        }

        // Generate file path for storage
        const file_name = req.file.originalname;
        const filePath = path.join("uploads", `${Date.now()}_${file_name}`);
        const fullFilePath = path.join(__dirname, "../", filePath);

        // Save the file
        fs.writeFileSync(fullFilePath, req.file.buffer);
        console.log("✅ File saved at:", fullFilePath);

        // Insert file details into the database
        const query = `INSERT INTO shared_files (lecturer_id, module, batch, file_name, file_path, note) 
                       VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [lecturer_id, module, batch, file_name, filePath, note];

        const result = await db.query(query, values);

        console.log("✅ File shared successfully!");

        return sendResponse(201, {
            message: "File shared successfully!",
            sharedFileId: result.insertId,
            filePath: filePath,
        });

    } catch (error) {
        console.error("❌ Unexpected error in shareFile:", error);
        return sendResponse(500, { error: "Internal Server Error", details: error.message });
    }
};

exports.getSharedFiles = async (req, res) => {
    try {
        const { module } = req.params;

        if (!module) {
            return res.status(400).json({ error: "Module parameter is missing." });
        }

        // ✅ Use async/await with db.query()
        const query = "SELECT file_name, file_path FROM shared_files WHERE module = ?";
        console.log("🔍 Executing query:", query, "with module:", module);

        // ✅ Fetch files from database
        const results = await db.query(query, [module]);

        if (!results || results.length === 0) {
            console.log("❌ No shared files found for module:", module);
            return res.status(404).json({ error: "No shared files found." });
        }

        console.log("✅ Successfully retrieved shared files.");
        return res.status(200).json({
            message: "Shared files retrieved successfully!",
            sharedFiles: results.map(result => ({
                file_name: result.file_name,
                file_path: result.file_path
            }))
        });

    } catch (error) {
        console.error("❌ Internal server error:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

// 📌 Function: Download a shared file by ID
exports.downloadFile = async (req, res) => {
    try {
        const { filePath } = req.params;
        if (!filePath) {
            return res.status(400).json({ error: "File path is required." });
        }

        const fullFilePath = path.join(__dirname, "../", decodeURIComponent(filePath));

        // Check if file exists
        if (!fs.existsSync(fullFilePath)) {
            return res.status(404).json({ error: "File not found." });
        }

        res.download(fullFilePath); // Send file for download
    } catch (error) {
        console.error("Error in downloading file:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};