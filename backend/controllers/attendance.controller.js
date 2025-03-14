const db = require("../models");
const Attendance = db.attendance;

exports.addAttendance = async (req, res) => {
    try {
        const { studentId, firstName, lastName, attendance, classroom, module, batch, date } = req.body;
        
        if (!studentId || !firstName || !lastName || !attendance || !classroom || !module || !batch || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const newAttendance = await Attendance.create({
            studentId,
            firstName,
            lastName,
            attendance,
            classroom,
            module,
            batch,
            date
        });

        res.status(201).json(newAttendance);
    } catch (error) {
        console.error("Error adding attendance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
