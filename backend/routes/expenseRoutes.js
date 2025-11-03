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
router.post("/create",authMiddleware, createExpense);

// Get all expenses (you can later filter by groupId or userId)
router.get("/all",authMiddleware, getAllExpenses);

// Get expense by ID
router.get("/:id",authMiddleware, getExpenseById);

// Update expense (for settling payments or status update)
router.put("/update/:id", authMiddleware, updateExpense);

// Delete expense
router.delete("/delete/:id", authMiddleware, deleteExpense);

export default router;
