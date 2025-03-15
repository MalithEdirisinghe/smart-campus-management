const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignment.controller");
const { verifyToken } = require("../middleware/auth.jwt");
const upload = require("../middleware/multer.config");

// ✅ Route to create an assignment with file upload
router.post("/create", verifyToken, upload.single("file"), assignmentController.createAssignment);
router.get("/students", assignmentController.fetchStudentsByBatch);
router.post("/marks/add", assignmentController.addMarks);
router.get("/latest", assignmentController.getLatestAssignmentByModule);
router.post("/submit", upload.single('file'), assignmentController.submitAssignment);

module.exports = router;
