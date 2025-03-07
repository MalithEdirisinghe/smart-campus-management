// routes/student.routes.js
const { authJwt } = require('../middleware');
const controller = require('../controllers/student.controller');
const multer = require('../middleware/multer.config');

module.exports = function(app) {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Get student profile
  app.get(
    "/api/student/profile",
    [authJwt.verifyToken, authJwt.isStudent],
    controller.getProfile
  );

  // Update student profile (JSON data)
  app.put(
    "/api/student/profile",
    [authJwt.verifyToken, authJwt.isStudent],
    controller.updateProfile
  );

  // Upload profile picture only
  app.post(
    "/api/student/profile/upload",
    [authJwt.verifyToken, authJwt.isStudent, multer.single('profileImage')],
    controller.uploadProfileImage
  );
  
  // New combined endpoint for profile update with image
  app.post(
    "/api/student/profile/update",
    [authJwt.verifyToken, authJwt.isStudent, multer.single('profileImage')],
    controller.updateProfileWithImage
  );
};