import { Chat } from "../models/chatModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { groupId, senderId, message } = req.body;

    if (!groupId || !senderId || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const chat = await Chat.create({ groupId, senderId, message });
    res.status(201).json({ message: "Message sent", chat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Chat.find({ groupId }).populate("senderId", "name email");
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
