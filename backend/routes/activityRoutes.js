import express from "express";
import { getUserActivity } from "../controllers/activityController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:userId", authMiddleware, getUserActivity);

export default router;
