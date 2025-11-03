import mongoose from "mongoose";

const settlementSchema = new mongoose.Schema(
  {
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paidTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  },
  { timestamps: true }
);

export const Settlement = mongoose.model("Settlement", settlementSchema);
