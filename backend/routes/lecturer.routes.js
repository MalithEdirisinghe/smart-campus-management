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

  // Optional routes (ensure these methods are exported in lecturer.controller.js)
//   app.get(
//     "/api/lecturer/users",
//     [authJwt.verifyToken, authJwt.isLecturer],
//     controller.getLecturers
//   );

//   app.get(
//     "/api/lecturer/:id",
//     [authJwt.verifyToken, authJwt.isLecturer],
//     controller.getLecturerById
//   );
};
