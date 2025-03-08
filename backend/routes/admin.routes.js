// routes/admin.routes.js
const { authJwt } = require('../middleware');
const controller = require('../controllers/admin.controller');
const upload = require('../middleware/multer.config');

module.exports = function(app) {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Get admin profile
  app.get(
    "/api/admin/profile",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getProfile
  );

  // Update admin profile with image
  app.post(
    "/api/admin/profile/update",
    [authJwt.verifyToken, authJwt.isAdmin, upload.single('profileImage')],
    controller.updateProfile
  );
  
  // Create new user (admin or lecturer)
  app.post(
    "/api/admin/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.createUser
  );
};