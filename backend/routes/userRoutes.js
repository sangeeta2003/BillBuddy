import express from "express";
import { registerUser, signinUser } from "../controllers/userController.js";
import { getUserDashboard } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/signin", signinUser);
router.post("/login", signinUser); // Support both for compatibility
router.get("/dashboard/:userId", getUserDashboard);

export default router;
