const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const resourceRoutes = require("./routes/resource.routes");
const communicationRoutes = require("./routes/communication.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const assignmentRoutes = require("./routes/assignment.routes");

const app = express();

// ✅ Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// ✅ Parse JSON and URL-encoded requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Database Setup
const db = require("./models/db");

// ✅ Check Database Connection
db.testConnection().then(connected => {
  if (!connected) {
    console.error("Database connection failed. Exiting application.");
    process.exit(1);
  }
});

// ✅ Register Routes
require('./routes/auth.routes')(app);
require('./routes/student.routes')(app);
require('./routes/admin.routes')(app);
require('./routes/lecturer.routes')(app);
require('./routes/event.routes')(app);
require('./routes/resource.routes')(app);

// ✅ Assign Specific Endpoints
app.use("/api", attendanceRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/communication", communicationRoutes);

// ✅ Root Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Smart Campus Management System API." });
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ Set Port & Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// ✅ For Testing
module.exports = app;
