import express from "express";
import { getUserActivity, getGroupActivities } from "../controllers/activityController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// More specific route first
router.get("/user/:userId", authMiddleware, getUserActivity);
// Generic route for groupId (must come after specific routes)
router.get("/:groupId", authMiddleware, getGroupActivities);

export default router;
