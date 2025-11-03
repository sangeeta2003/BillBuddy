import { Group } from "../models/groupModel.js";
import { z } from "zod";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";
import { Expense } from "../models/expenseModel.js";
import { Settlement } from "../models/settlementModel.js";

const createGroupSchema = z.object({
  groupname: z.string().min(3, "Group name must be at least 3 characters"),
  description: z.string().min(3).optional(),
  members: z.array(z.string()).optional()
});

export const createGroup = async (req, res) => {
  try {
    const result = createGroupSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: result.error.errors,
      });
    }

    const { groupname, description = "", members = [] } = result.data;
    const createdBy = req.userId; 

    const creator = await User.findById(createdBy);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return res.status(400).json({ message: "One or more members not found" });
    }

    const group = await Group.create({
      groupname,
      description,
      members: [...members, createdBy],
      createdBy,
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};


export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate("members", "name email");
    res.status(200).json(groups);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};


const addMemberSchema = z.object({
  groupId: z.string(),
  members: z.array(z.string()).min(1, "At least one member ID is required"),
});

export const addMembersToGroup = async (req, res) => {
  try {
    const result = addMemberSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: result.error.errors,
      });
    }

    const { groupId, members } = result.data;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return res.status(400).json({ message: "One or more members not found" });
    }

    const uniqueMembers = members.filter(
      (memberId) => !group.members.includes(memberId)
    );

    if (uniqueMembers.length === 0) {
      return res
        .status(400)
        .json({ message: "All members are already in the group" });
    }

    group.members.push(...uniqueMembers);
    await group.save();

    const updatedGroup = await Group.findById(groupId).populate(
      "members",
      "name email"
    );

    res.status(200).json({
      message: "Members added successfully",
      group: updatedGroup,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

export const getGroupSummary = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const group = await Group.findById(groupId).populate("members", "name email");
    if (!group) return res.status(404).json({ message: "Group not found" });

    const balances = {};
    group.members.forEach((m) => {
      balances[m._id.toString()] = { user: m.name, email: m.email, net: 0 };
    });

    const expenses = await Expense.find({ groupId })
      .populate("paidBy", "name email")
      .populate("splitDetails.user", "name email");

    for (const exp of expenses) {
      const paidBy = exp.paidBy._id.toString();
      for (const detail of exp.splitDetails) {
        const userId = detail.user._id.toString();
        if (userId !== paidBy) {
          balances[userId].net -= detail.amount;
          balances[paidBy].net += detail.amount;
        }
      }
    }

    const settlements = await Settlement.find({ groupId });
    for (const set of settlements) {
      const payer = set.paidBy.toString();
      const receiver = set.paidTo.toString();
      const amt = set.amount;
      if (balances[payer]) balances[payer].net += amt;
      if (balances[receiver]) balances[receiver].net -= amt;
    }

    const summary = Object.values(balances);

    res.status(200).json({
      groupId: group._id,
      groupName: group.groupname,
      balances: summary,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


