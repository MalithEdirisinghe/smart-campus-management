const express = require("express");
const router = express.Router();
const { authJwt } = require("../middleware");
const groupController = require("../controllers/group.controller");
const messageController = require("../controllers/message.controller");
const fileController = require("../controllers/file.controller");
const upload = require("../middleware/multer.config");

// Middleware to set headers for all requests in this route
router.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// =============================
// 📌 Group Management (Admin Only)
// =============================

router.post(
  "/admin/communication/groups",
  [authJwt.verifyToken, authJwt.isAdmin],
  groupController.createGroup
);

router.get(
  "/admin/communication/groups",
  [authJwt.verifyToken, authJwt.isAdmin],
  groupController.getGroups
);

router.get(
  "/admin/communication/groups/:id",
  [authJwt.verifyToken, authJwt.isAdmin],
  groupController.getGroupById
);

router.put(
  "/admin/communication/groups/:id",
  [authJwt.verifyToken, authJwt.isAdmin],
  groupController.updateGroup
);

router.delete(
  "/admin/communication/groups/:id",
  [authJwt.verifyToken, authJwt.isAdmin],
  groupController.deleteGroup
);

router.get(
  "/admin/communication/groups/:id/members",
  [authJwt.verifyToken, authJwt.isAdmin],
  groupController.getGroupMembers
);

router.post(
  "/admin/communication/groups/:id/members",
  [authJwt.verifyToken, authJwt.isAdmin],
  groupController.addGroupMember
);

router.delete(
  "/admin/communication/groups/:id/members/:userId",
  [authJwt.verifyToken, authJwt.isAdmin],
  groupController.removeGroupMember
);

// =============================
// 📌 File Sharing (Lecturers Only)
// =============================

router.post(
  "/share-file",
  [authJwt.verifyToken, authJwt.isLecturer],
  upload.single("file"),
  fileController.shareFile
);

router.get(
  "/communication/shared-files/:module/:batch",
  [authJwt.verifyToken],
  fileController.getSharedFiles
);

// =============================
// 📌 Direct Messaging (All Users)
// =============================

router.post(
  "/messages",
  [authJwt.verifyToken,authJwt.isLecturer],
  messageController.sendDirectMessage
);

router.get(
  "/communication/messages/inbox",
  [authJwt.verifyToken],
  messageController.getInboxMessages
);

router.get(
  "/communication/messages/sent",
  [authJwt.verifyToken],
  messageController.getSentMessages
);

router.put(
  "/communication/messages/:id/read",
  [authJwt.verifyToken],
  messageController.markMessageAsRead
);

router.get(
  "/communication/messages/unread-count",
  [authJwt.verifyToken],
  messageController.getUnreadCount
);

// =============================
// 📌 Group Messaging (All Users)
// =============================

router.post(
  "/communication/groups/:id/messages",
  [authJwt.verifyToken],
  messageController.sendGroupMessage
);

router.get(
  "/communication/groups/:id/messages",
  [authJwt.verifyToken],
  messageController.getGroupMessages
);

router.put(
  "/communication/groups/messages/:id/read",
  [authJwt.verifyToken],
  messageController.markGroupMessageAsRead
);

// ✅ Export Router
module.exports = router;
