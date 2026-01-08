import { Expense } from "../models/expenseModel.js";
import { Notification } from "../models/notificationModel.js";
import { getIo } from "../socket.js";
import { z } from "zod";
import mongoose from "mongoose";
import { User } from "../models/userModel.js";

const expenseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  amount: z.number().positive("Amount must be greater than 0"),
  paidBy: z.string(),
  participants: z.array(z.string()).nonempty("Participants are required"),
  splitType: z.enum(["equal", "unequal", "percentage"]),
  groupId: z.string().optional(),
  splitDetails: z
    .array(
      z.object({
        user: z.string(),
        amount: z.number().optional(),
        percentage: z.number().optional(),
        status: z.enum(["paid", "unpaid"]).default("unpaid"),
      })
    )
    .optional(),
});

export const createExpense = async (req, res) => {
  try {
    const result = expenseSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.errors,
      });
    }

    const { title, amount, paidBy, participants, splitType, groupId, splitDetails = [] } =
      result.data;

    const allUserIds = Array.from(new Set([paidBy, ...participants]));
    const invalidIds = allUserIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: "Invalid user ID(s)",
        invalidIds,
      });
    }

    const objectIds = allUserIds.map((id) => new mongoose.Types.ObjectId(id));
    const validUsers = await User.find({ _id: { $in: objectIds } });
    if (validUsers.length !== allUserIds.length) {
      return res
        .status(400)
        .json({ message: "One or more users not found in database" });
    }

    // Compute split details
    let computedSplit = [];
    if (splitType === "equal") {
      const share = amount / participants.length;
      computedSplit = participants.map((userId) => ({
        user: userId,
        amount: share,
        status: "unpaid",
      }));
    } else if (splitType === "unequal") {
      const total = splitDetails.reduce((sum, s) => sum + (s.amount || 0), 0);
      if (total !== amount) {
        return res
          .status(400)
          .json({ message: "Split amounts do not add up to total" });
      }
      computedSplit = splitDetails;
    } else if (splitType === "percentage") {
      const totalPercentage = splitDetails.reduce(
        (sum, s) => sum + (s.percentage || 0),
        0
      );
      if (totalPercentage !== 100) {
        return res
          .status(400)
          .json({ message: "Total percentage must equal 100" });
      }
      computedSplit = splitDetails.map((s) => ({
        user: s.user,
        amount: (s.percentage / 100) * amount,
        status: "unpaid",
      }));
    }

    // Save expense
    const expense = await Expense.create({
      title,
      amount,
      paidBy,
      participants,
      splitType,
      groupId: groupId || null,
      splitDetails: computedSplit,
    });

    // 🔔 Notify participants in real-time (except payer)
    const io = getIo();
    const payer = await User.findById(paidBy);

    for (const userId of participants) {
      if (userId !== paidBy) {
        const notificationMessage = `${payer.name} added a new expense: ${title}`;

        await Notification.create({
          userId,
          type: "expense",
          message: notificationMessage,
        });

        io.to(userId).emit("receiveNotification", {
          type: "expense",
          message: notificationMessage,
          time: new Date(),
        });
      }
    }

    res.status(201).json({
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate("paidBy", "name email")
      .populate("participants", "name email")
      .populate("splitDetails.user", "name email");
    res.status(200).json(expenses);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("paidBy", "name email")
      .populate("participants", "name email")
      .populate("splitDetails.user", "name email");
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    const split = expense.splitDetails.find(
      (s) => s.user.toString() === userId
    );
    if (!split) {
      return res.status(404).json({ message: "User not part of expense" });
    }
    split.status = status;
    await expense.save();
    res.status(200).json({ message: "Status updated successfully", expense });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
