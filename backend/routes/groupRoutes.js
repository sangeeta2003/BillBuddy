import express from "express";
import { createGroup, getAllGroups } from "../controllers/groupController.js";
import { addMembersToGroup } from "../controllers/groupController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getGroupSummary } from "../controllers/groupController.js";
const router = express.Router();

router.post("/create", authMiddleware, createGroup);
router.get("/", getAllGroups);
router.put('/add-members',authMiddleware,addMembersToGroup);
router.get("/:groupId/summary", authMiddleware, getGroupSummary);

export default router;
