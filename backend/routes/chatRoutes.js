import express from "express";
import { sendMessage, getMessages } from "../controllers/chatController.js";

const router = express.Router();

// Send message
router.post("/", sendMessage);

// Get all messages of a group
router.get("/:groupId", getMessages);

export default router;
