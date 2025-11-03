import { Expense } from "../models/expenseModel.js";
import { Settlement } from "../models/settlementModel.js";

export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch expenses where user is involved
    const expenses = await Expense.find({
      participants: userId,
    })
      .populate("paidBy", "name")
      .sort({ createdAt: -1 });

    // Fetch settlements where user is involved
    const settlements = await Settlement.find({
      $or: [{ paidBy: userId }, { receivedBy: userId }],
    })
      .populate("paidBy", "name")
      .populate("receivedBy", "name")
      .sort({ createdAt: -1 });

    // Format both into a unified timeline
    const activities = [];

    expenses.forEach((exp) => {
      activities.push({
        type: "expense",
        message: `${exp.paidBy.name} added expense "${exp.title}" of ₹${exp.amount}`,
        createdAt: exp.createdAt,
      });
    });

    settlements.forEach((s) => {
      activities.push({
        type: "settlement",
        message: `${s.paidBy.name} settled ₹${s.amount} with ${s.receivedBy.name}`,
        createdAt: s.createdAt,
      });
    });

    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user activity" });
  }
};
