import express from "express";
import { getUserBalance } from "../controllers/balanceController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get balance summary for a user
router.get("/:userId", authMiddleware, getUserBalance);

export default router;
