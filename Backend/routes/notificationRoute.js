const express = require("express");

const router = express.Router();

const { authMiddleware } = require("../controller/auth");

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controller/notificationController");


router.get(
  "/notifications",
  authMiddleware,
  getNotifications
);


router.put(
  "/notifications/:id/read",
  authMiddleware,
  markAsRead
);


router.put(
  "/notifications/read-all",
  authMiddleware,
  markAllAsRead
);


router.delete(
  "/notifications/:id",
  authMiddleware,
  deleteNotification
);


module.exports = router;