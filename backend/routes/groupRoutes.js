import express from "express";
import { createGroup, getAllGroups, addMembersToGroup } from "../controllers/groupController";

const router = express.Router();

router.post("/create", createGroup);
router.get("/", getAllGroups);
router.put('/add-members',addMembersToGroup);

export default router;
