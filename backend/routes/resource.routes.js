const { authJwt } = require("../middleware");
const controller = require("../controllers/resource.controller");

module.exports = function (app) {
  // Middleware to allow cross-origin requests
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  console.log("📌 Resource routes initialized"); // Debugging log

  /**
   * 🔹 Classrooms Routes
   */
  app.get(
    "/api/resources/classrooms",
    [authJwt.verifyToken],
    controller.getClassrooms
  );

  /**
   * 🔹 Equipment Routes
   */
  app.get(
    "/api/resources/equipment",
    [authJwt.verifyToken],
    controller.getEquipment
  );

  /**
   * 🔹 Reservation Routes (Admin Only)
   */
  // app.post(
  //   "/api/resources/reserve",
  //   [authJwt.verifyToken, authJwt.isAdmin],
  //   controller.reserveResource
  // );

  // app.post(
  //   "/api/resources/release",
  //   [authJwt.verifyToken, authJwt.isAdmin],
  //   controller.releaseResource
  // );

  app.post("/api/resources/reserve", [authJwt.verifyToken, authJwt.isLecturer], controller.reserveEquipment);
  app.post("/api/resources/release", [authJwt.verifyToken], controller.releaseEquipment);

  /**
   * 🔹 Reservation Management (Admin Only)
   */
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

  /**
   * 🛑 Global Error Handling Middleware (Catches Unexpected Errors)
   */
  app.use((err, req, res, next) => {
    console.error("🚨 Error in resource routes:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  });
};
