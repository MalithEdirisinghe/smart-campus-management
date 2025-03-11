// // routes/admin.routes.js
// const { authJwt } = require('../middleware');
// const controller = require('../controllers/admin.controller');
// const upload = require('../middleware/multer.config');

// module.exports = function(app) {
//   app.use((req, res, next) => {
//     res.header(
//       "Access-Control-Allow-Headers",
//       "x-access-token, Origin, Content-Type, Accept"
//     );
//     next();
//   });

//   // Existing routes
//   app.get(
//     "/api/admin/profile",
//     [authJwt.verifyToken, authJwt.isAdmin],
//     controller.getProfile
//   );

//   app.post(
//     "/api/admin/profile/update",
//     [authJwt.verifyToken, authJwt.isAdmin, upload.single('profileImage')],
//     controller.updateProfile
//   );
  
//   app.post(
//     "/api/admin/users",
//     [authJwt.verifyToken, authJwt.isAdmin],
//     controller.createUser
//   );

//   // User retrieval routes
//   app.get(
//     "/api/admin/users",
//     [authJwt.verifyToken, authJwt.isAdmin],
//     controller.getAllUsers
//   );

//   app.get(
//     "/api/admin/users/admins",
//     [authJwt.verifyToken, authJwt.isAdmin],
//     controller.getAdmins
//   );

//   app.get(
//     "/api/admin/users/lecturers",
//     [authJwt.verifyToken, authJwt.isAdmin],
//     controller.getLecturers
//   );

//   app.get(
//     "/api/admin/users/students",
//     [authJwt.verifyToken, authJwt.isAdmin],
//     controller.getStudents
//   );

//   // User update routes
//   app.put(
//     "/api/admin/users/admin/:id",
//     [authJwt.verifyToken, authJwt.isAdmin],
//     controller.updateAdmin
//   );

//   app.put(
//     "/api/admin/users/lecturer/:id",
//     [authJwt.verifyToken, authJwt.isAdmin],
//     controller.updateLecturer
//   );

//   app.put(
//     "/api/admin/users/student/:id",
//     [authJwt.verifyToken, authJwt.isAdmin],
//     controller.updateStudent
//   );

//   // User delete routes
// app.delete(
//   "/api/admin/users/admin/:id",
//   [authJwt.verifyToken, authJwt.isAdmin],
//   controller.deleteAdmin
// );

// app.delete(
//   "/api/admin/users/lecturer/:id",
//   [authJwt.verifyToken, authJwt.isAdmin],
//   controller.deleteLecturer
// );

// app.delete(
//   "/api/admin/users/student/:id",
//   [authJwt.verifyToken, authJwt.isAdmin],
//   controller.deleteStudent
// );
// };

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

  // Admin Profile Routes
  app.get(
    "/api/admin/profile",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getProfile
  );

  app.post(
    "/api/admin/profile/update",
    [authJwt.verifyToken, authJwt.isAdmin, upload.single('profileImage')],
    controller.updateProfile
  );
  
  // User Management Routes
  app.post(
    "/api/admin/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.createUser
  );

  app.get(
    "/api/admin/users",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllUsers
  );

  app.get(
    "/api/admin/users/admins",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAdmins
  );

  app.get(
    "/api/admin/users/lecturers",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getLecturers
  );

  app.get(
    "/api/admin/users/students",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getStudents
  );

  app.put(
    "/api/admin/users/admin/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateAdmin
  );

  app.put(
    "/api/admin/users/lecturer/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateLecturer
  );

  app.put(
    "/api/admin/users/student/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateStudent
  );

  app.delete(
    "/api/admin/users/admin/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteAdmin
  );

  app.delete(
    "/api/admin/users/lecturer/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteLecturer
  );

  app.delete(
    "/api/admin/users/student/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteStudent
  );

  // Report Fetching Routes (NEWLY ADDED)
  app.get(
    "/api/admin/reports/students",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getStudentReports
  );

  app.get(
    "/api/admin/reports/lecturers",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getLecturerReports
  );
};
