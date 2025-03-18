const express = require("express");
const { getStudentClasses, getAvailableModules } = require("../controllers/studentClass.controller");
const { verifyToken } = require("../middleware/auth.jwt");

const router = express.Router();

// Fix route to fetch classes by batch
router.get("/classes/:batchId", verifyToken, getStudentClasses);

// Fix route to fetch available modules by batch
router.get("/available-modules/:batchId", verifyToken, getAvailableModules);

module.exports = router;
