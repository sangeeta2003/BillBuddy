import { Group } from "../models/groupModel";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import dotenv from "dotenv";
import { User } from "../models/userModel.js";

dotenv.config();


const createGroupSchema = z.object({
    groupname : z.string().min(3),
    description:z.string().min(3).optional(),
    createdBy:z.string(),
    members:z.array(z.string())
});

export const createGroup = async()=>{
    try{
        const {success, data, error} = createGroupSchema.safeParse(req.body);
        if(!success){
            return res.status(400).json({
        message: "Invalid input data",
        errors: error.errors,
      });
    }

    const{groupname,description,createdBy,members=[]} = req.body;
    const creator = await User.findById(createdBy);
    if(!creator){
        return res.status(404).json({ message: "Creator not found" });
    }

    const validMemebrs = await User.find({_id:{$in:members}});
    if(validMemebrs.length != members.length){
         return res.status(400).json({ message: "One or more members not found" });
    }

    const group = await Group.create({
        groupname,
        description,
        members:[...members,createdBy],
        createdBy,
        createdAt:new Date()
    });

     return res.status(201).json({
      message: "Group created successfully",
      group,
    });


    }catch(e){
        console.error(e);
    res.status(500).json({ message: e.message });

    }  
};

export const getAllGroups = async(req,res)=>{
    try{

        const groups = await Group.find().populate("members", "name email");
         res.status(200).json(groups);

    }catch(e){
        console.error(e);
    res.status(500).json({ message: e.message });
    }
}

const addmemberSchema = z.object({
    groupId:z.string(),
    members: z.array(z.string()).min(1, "At least one member ID is required"),
});

export const addMembersToGroup = async(req,res)=>{
    try{
        const{success,data,error}= addmemberSchema.safeParse(req.body);

        if(!success){
            return res.status(400).json({
        message: "Invalid input data",
        errors: error.errors,
      });
        }
const{groupId,members} = data;

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
      return res.status(400).json({ message: "All members are already in the group" });
    }

    group.members.push(...uniqueMembers);
    await group.save();

    const updatedBody = await Group.findById(groupId).populate("members","name email");
    res.status(200).json({
      message: "Members added successfully",
      group: updatedGroup,
    });

    }catch(e){
        console.error(e);
    res.status(500).json({ message: e.message });

    }
}







