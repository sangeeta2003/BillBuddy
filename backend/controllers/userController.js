import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Expense } from "../models/expenseModel.js";
import { Settlement } from "../models/settlementModel.js";

dotenv.config();

const signUpSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(3),
});

export const registerUser = async (req, res) => {
  try {
    const { success } = signUpSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({ message: "Invalid input format" });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already taken" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const dbUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: dbUser._id, email: dbUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: dbUser._id, email: dbUser.email },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signinUser = async (req, res) => {
  try {
    const { success } = signInSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({ message: "Incorrect inputs" });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "Login successful", token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};


export const getUserDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // All expenses where the user participated
    const expenses = await Expense.find({
      participants: userId,
    }).populate("paidBy", "name");

    let totalOwed = 0;
    let totalLent = 0;

    // Calculate expense-based owed/lent
    expenses.forEach((exp) => {
      const share = exp.amount / exp.participants.length;
      if (exp.paidBy._id.toString() === userId) {
        totalLent += exp.amount - share;
      } else {
        totalOwed += share;
      }
    });

    // Apply settlements
    const settlements = await Settlement.find({
      $or: [{ paidBy: userId }, { receivedBy: userId }],
    });

    settlements.forEach((s) => {
      if (s.paidBy.toString() === userId) totalOwed -= s.amount;
      else totalLent -= s.amount;
    });

    res.json({
      userId,
      totalOwed: Math.max(totalOwed, 0),
      totalLent: Math.max(totalLent, 0),
      netBalance: totalLent - totalOwed,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
