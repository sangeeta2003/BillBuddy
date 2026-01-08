import express from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", createNotification);
router.get("/:userId", getUserNotifications);
router.put("/:id", markAsRead);
router.put("/:notificationId/read", markAsRead); // Support both

export default router;
