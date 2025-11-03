import express from "express";
import { registerUser, signinUser } from "../controllers/userController.js";
import { getUserDashboard } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", signinUser);
router.get("/:userId/dashboard", getUserDashboard);

export default router;
