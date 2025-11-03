import { Settlement } from "../models/settlementModel.js";
import { Expense } from "../models/expenseModel.js";
import mongoose from "mongoose";


export const settlePayment = async (req, res) => {
  try {
    const { paidBy, paidTo, amount, groupId } = req.body;

   
    if (!mongoose.Types.ObjectId.isValid(paidBy) || !mongoose.Types.ObjectId.isValid(paidTo)) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    
    const settlement = await Settlement.create({
      paidBy,
      paidTo,
      amount,
      groupId,
    });

    

    res.status(201).json({
      message: "Settlement recorded successfully",
      settlement,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getSettlementHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Fetch all settlements where user is either payer or receiver
    const settlements = await Settlement.find({
      $or: [{ paidBy: userId }, { paidTo: userId }],
    })
      .populate("paidBy", "name email")
      .populate("paidTo", "name email")
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      message: "Settlement history fetched successfully",
      total: settlements.length,
      settlements,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

