// routes/event.routes.js
const { authJwt } = require('../middleware');
const controller = require('../controllers/event.controller');

module.exports = function (app) {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Create a new event/announcement (admin only)
  app.post(
    "/api/admin/events",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.createEvent
  );

  // Get all events/announcements
  app.get(
    "/api/events",
    [authJwt.verifyToken],
    controller.getAllEvents
  );

  // Get all events for admin dashboard
  app.get(
    "/api/admin/events",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllEvents
  );

  // Get a single event/announcement by ID
  app.get(
    "/api/events/:id",
    [authJwt.verifyToken],
    controller.getEventById
  );

  // Update an event/announcement (admin only)
  app.put(
    "/api/admin/events/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.updateEvent
  );

  // Delete an event/announcement (admin only)
  app.delete(
    "/api/admin/events/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.deleteEvent
  );

  app.get(
    "/api/events",
    [authJwt.verifyToken],
    controller.getEvents
  );

  app.get(
    "/api/events/ongoing",
    [authJwt.verifyToken],
    (req, res, next) => {
      req.query.ongoing = 'true';
      next();
    },
    controller.getEvents
  );
};