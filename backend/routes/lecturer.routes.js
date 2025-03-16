const { authJwt } = require('../middleware');
const controller = require('../controllers/lecturer.controller');
const upload = require('../middleware/multer.config');

module.exports = function(app) {
  // Set common headers
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Lecturer Profile Routes
  app.get(
    "/api/lecturer/profile",
    [authJwt.verifyToken, authJwt.isLecturer],
    controller.getProfile
  );

  app.put(
    "/api/lecturer/profile/update",
    [authJwt.verifyToken, authJwt.isLecturer, upload.single('profileImage')],
    controller.updateProfile
  );
  app.post(
    "/api/lecturer/classes",
    [authJwt.verifyToken, authJwt.isLecturer],
    controller.addClass
  );  
  app.get(
    '/api/lecturer/classes',
    [authJwt.verifyToken, authJwt.isLecturer],
    controller.getClasses  // <-- define this method in lecturer.controller
  );

  // Example route for GET /api/lecturer/attendance
  app.get(
    '/api/lecturer/attendance',
    [authJwt.verifyToken, authJwt.isLecturer],
    controller.getAttendance  // <-- define this method in lecturer.controller
  );

  app.get("/api/lecturer/students", [authJwt.verifyToken, authJwt.isLecturer], controller.getStudentsByBatch)
};
