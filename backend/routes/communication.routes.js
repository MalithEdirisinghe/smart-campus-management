// routes/communication.routes.js
const { authJwt } = require('../middleware');
const groupController = require('../controllers/group.controller');
const messageController = require('../controllers/message.controller');

module.exports = function(app) {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Group routes
  // Create a new group (admin only)
  app.post(
    "/api/admin/communication/groups",
    [authJwt.verifyToken, authJwt.isAdmin],
    groupController.createGroup
  );

  // Get all groups
  app.get(
    "/api/admin/communication/groups",
    [authJwt.verifyToken, authJwt.isAdmin],
    groupController.getGroups
  );

  // Get a group by ID
  app.get(
    "/api/admin/communication/groups/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    groupController.getGroupById
  );

  // Update a group (admin only)
  app.put(
    "/api/admin/communication/groups/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    groupController.updateGroup
  );

  // Delete a group (admin only)
  app.delete(
    "/api/admin/communication/groups/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    groupController.deleteGroup
  );

  // Get group members
  app.get(
    "/api/admin/communication/groups/:id/members",
    [authJwt.verifyToken, authJwt.isAdmin],
    groupController.getGroupMembers
  );

  // Add a member to a group (admin only)
  app.post(
    "/api/admin/communication/groups/:id/members",
    [authJwt.verifyToken, authJwt.isAdmin],
    groupController.addGroupMember
  );

  // Remove a member from a group (admin only)
  app.delete(
    "/api/admin/communication/groups/:id/members/:userId",
    [authJwt.verifyToken, authJwt.isAdmin],
    groupController.removeGroupMember
  );

  // Message routes
  // Send a direct message (all users)
  app.post(
    "/api/communication/messages",
    [authJwt.verifyToken],
    messageController.sendDirectMessage
  );

  // Send a group message (all users)
  app.post(
    "/api/communication/groups/:id/messages",
    [authJwt.verifyToken],
    messageController.sendGroupMessage
  );

  // Get inbox messages (direct messages received)
  app.get(
    "/api/communication/messages/inbox",
    [authJwt.verifyToken],
    messageController.getInboxMessages
  );

  // Get sent messages (direct messages sent)
  app.get(
    "/api/communication/messages/sent",
    [authJwt.verifyToken],
    messageController.getSentMessages
  );

  // Get group messages
  app.get(
    "/api/communication/groups/:id/messages",
    [authJwt.verifyToken],
    messageController.getGroupMessages
  );

  // Mark direct message as read
  app.put(
    "/api/communication/messages/:id/read",
    [authJwt.verifyToken],
    messageController.markMessageAsRead
  );

  // Mark group message as read
  app.put(
    "/api/communication/groups/messages/:id/read",
    [authJwt.verifyToken],
    messageController.markGroupMessageAsRead
  );

  // Get unread messages count
  app.get(
    "/api/communication/messages/unread-count",
    [authJwt.verifyToken],
    messageController.getUnreadCount
  );
};