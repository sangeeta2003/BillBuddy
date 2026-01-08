import express from "express";
import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
} from "../controllers/expenseController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create expense
router.post("/", authMiddleware, createExpense);
router.post("/create", authMiddleware, createExpense); // Support both

// Get all expenses (you can later filter by groupId or userId)
router.get("/", authMiddleware, getAllExpenses);
router.get("/all", authMiddleware, getAllExpenses); // Support both

// Get expense by ID
router.get("/:id", authMiddleware, getExpenseById);

// Update expense (for settling payments or status update)
router.put("/:id", authMiddleware, updateExpense);
router.put("/update/:id", authMiddleware, updateExpense); // Support both

// Delete expense
router.delete("/:id", authMiddleware, deleteExpense);
router.delete("/delete/:id", authMiddleware, deleteExpense); // Support both

export default router;
