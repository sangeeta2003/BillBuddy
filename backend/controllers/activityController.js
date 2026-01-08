import { Expense } from "../models/expenseModel.js";
import { Settlement } from "../models/settlementModel.js";
import mongoose from "mongoose";

export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Fetch expenses where user is involved
    const expenses = await Expense.find({
      participants: userId,
    })
      .populate("paidBy", "name")
      .sort({ createdAt: -1 });

    // Fetch settlements where user is involved
    const settlements = await Settlement.find({
      $or: [{ paidBy: userId }, { paidTo: userId }],
    })
      .populate("paidBy", "name")
      .populate("paidTo", "name")
      .sort({ createdAt: -1 });

    // Format both into a unified timeline
    const activities = [];

    expenses.forEach((exp) => {
      activities.push({
        type: "expense",
        message: `${exp.paidBy?.name || 'Unknown'} added expense "${exp.title}" of ₹${exp.amount}`,
        createdAt: exp.createdAt,
      });
    });

    settlements.forEach((s) => {
      activities.push({
        type: "settlement",
        message: `${s.paidBy?.name || 'Unknown'} settled ₹${s.amount} with ${s.paidTo?.name || 'Unknown'}`,
        createdAt: s.createdAt,
      });
    });

    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user activity" });
  }
};

export const getGroupActivities = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    // Fetch expenses for this group
    const expenses = await Expense.find({
      groupId: groupId,
    })
      .populate("paidBy", "name email")
      .populate("participants", "name email")
      .sort({ createdAt: -1 });

    // Fetch settlements for this group (if groupId is stored in settlements)
    const settlements = await Settlement.find({
      groupId: groupId,
    })
      .populate("paidBy", "name")
      .populate("paidTo", "name")
      .sort({ createdAt: -1 });

    // Format both into a unified timeline
    const activities = [];

    expenses.forEach((exp) => {
      activities.push({
        type: "expense",
        message: `${exp.paidBy?.name || 'Unknown'} added expense "${exp.title}" of ₹${exp.amount}`,
        createdAt: exp.createdAt,
        expense: exp,
      });
    });

    settlements.forEach((s) => {
      activities.push({
        type: "settlement",
        message: `${s.paidBy?.name || 'Unknown'} settled ₹${s.amount} with ${s.paidTo?.name || 'Unknown'}`,
        createdAt: s.createdAt,
        settlement: s,
      });
    });

    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch group activity" });
  }
};
