import express from "express";
import { registerUser, signinUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", signinUser);

export default router;
