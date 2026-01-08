import express from "express";
import { settlePayment } from "../controllers/settlementController.js";
import { getSettlementHistory } from "../controllers/settlementController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/", settlePayment);
router.get("/:userId", authMiddleware, getSettlementHistory);
router.get("/history/:userId", authMiddleware, getSettlementHistory); // Support both

export default router;
