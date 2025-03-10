const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express(); 

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Parse requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database setup
const db = require("./models/db");

// Check database connection
db.testConnection().then(connected => {
  if (!connected) {
    console.error("Database connection failed. Exiting application.");
    process.exit(1);
  }
});

// Routes
require('./routes/auth.routes')(app);
require('./routes/student.routes')(app);
require('./routes/admin.routes')(app);
require('./routes/event.routes')(app);
require('./routes/resource.routes')(app);
require('./routes/communication.routes')(app); 

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Smart Campus Management System API." });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Set port and start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// For testing
module.exports = app;