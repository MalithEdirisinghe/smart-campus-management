const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendance.controller");
const authJwt = require("../middleware/auth.jwt");

router.post("/lecturer/attendance", authJwt.verifyToken, attendanceController.addAttendance);

module.exports = router;