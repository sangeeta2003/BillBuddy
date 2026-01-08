import express from "express";
import { 
  createGroup, 
  getAllGroups, 
  getGroupById, 
  getUserGroups,
  addMembersToGroup,
  getGroupSummary 
} from "../controllers/groupController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Test route to verify routing works
router.get("/test", (req, res) => {
  res.json({ message: "Group routes are working!" });
});

// Create group - requires authentication
router.post("/", authMiddleware, createGroup);

// Get all groups
router.get("/", getAllGroups);

// Get user's groups
router.get("/user/:userId", getUserGroups);

// Get group by ID (must come after /user/:userId)
router.get("/:groupId", getGroupById);

// Get group summary
router.get("/:groupId/summary", authMiddleware, getGroupSummary);

// Add members to group
router.put('/add-members', authMiddleware, addMembersToGroup);

export default router;
