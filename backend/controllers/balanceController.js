import { Expense } from "../models/expenseModel.js";
import { Settlement } from "../models/settlementModel.js";
import mongoose from "mongoose";

export const getUserBalance = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    
    const expenses = await Expense.find({
      participants: userId,
    })
      .populate("paidBy", "name email")
      .populate("splitDetails.user", "name email");

    let owes = [];
    let owedBy = [];
    let net = 0;

    for (const exp of expenses) {
      const paidBy = exp.paidBy._id.toString();

      for (const detail of exp.splitDetails) {
        const participantId = detail.user._id.toString();

        if (participantId === userId && paidBy !== userId) {
          owes.push({
            to: exp.paidBy.name,
            email: exp.paidBy.email,
            amount: detail.amount,
            expense: exp.title,
          });
          net -= detail.amount;
        }

        if (paidBy === userId && participantId !== userId) {
          owedBy.push({
            from: detail.user.name,
            email: detail.user.email,
            amount: detail.amount,
            expense: exp.title,
          });
          net += detail.amount;
        }
      }
    }

    
    const settlements = await Settlement.find({
      $or: [{ paidBy: userId }, { paidTo: userId }],
    });

    for (const s of settlements) {
      const paidBy = s.paidBy.toString();
      const paidTo = s.paidTo.toString();

      if (paidBy === userId) {
        
        net += s.amount;
        owes = owes.map((o) => {
          if (o.email === s.paidTo.email) {
            o.amount -= s.amount;
          }
          return o;
        });
      }

      if (paidTo === userId) {
       
        net -= s.amount;
        owedBy = owedBy.map((o) => {
          if (o.email === s.paidBy.email) {
            o.amount -= s.amount;
          }
          return o;
        });
      }
    }

    
    owes = owes.filter((o) => o.amount > 0);
    owedBy = owedBy.filter((o) => o.amount > 0);

    res.status(200).json({
      userId,
      owes,
      owedBy,
      netBalance: net,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
