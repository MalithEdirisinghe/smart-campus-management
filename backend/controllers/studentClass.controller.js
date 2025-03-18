const db = require("../models/db");

// Fetch registered classes for a batch
exports.getStudentClasses = async (req, res) => {
    const { batchId } = req.params;

    try {
        const query = `
            SELECT m.module_name, c.starting_date, c.classroom, c.start_time, c.end_time
            FROM lecturer_classes c
            JOIN modules m ON c.module_id = m.module_id
            WHERE c.batch = ?;
        `;
        const [results] = await db.query(query, [batchId]);

        if (results.length === 0) {
            return res.status(404).json({ error: "No classes found for this batch." });
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch student classes" });
    }
};

// Fetch available modules for a batch
exports.getAvailableModules = async (req, res) => {
    const { batchId } = req.params;

    try {
        const query = `
            SELECT m.module_id, m.module_name
            FROM modules m
            WHERE m.batch = ?;
        `;
        const [results] = await db.query(query, [batchId]);

        if (results.length === 0) {
            return res.status(404).json({ error: "No available modules for this batch." });
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch available modules" });
    }
};
