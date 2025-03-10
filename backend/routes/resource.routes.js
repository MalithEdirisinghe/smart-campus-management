// routes/resource.routes.js
const { authJwt } = require('../middleware');
const controller = require('../controllers/resource.controller');

module.exports = function(app) {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Routes for classrooms
  app.get(
    "/api/resources/classrooms",
    [authJwt.verifyToken],
    controller.getClassrooms
  );

  // Routes for equipment
  app.get(
    "/api/resources/equipment",
    [authJwt.verifyToken],
    controller.getEquipment
  );

  // Reserve a resource (admin only)
  app.post(
    "/api/resources/reserve",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.reserveResource
  );

  // Release a resource (admin only)
  app.post(
    "/api/resources/release",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.releaseResource
  );

app.get(
  "/api/resources/reservation-details",
  [authJwt.verifyToken, authJwt.isAdmin],
  controller.getReservationDetails
);

app.put(
  "/api/resources/update-reservation",
  [authJwt.verifyToken, authJwt.isAdmin],
  controller.updateReservation
);
};