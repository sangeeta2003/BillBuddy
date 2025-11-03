import { Notification } from "../models/notificationModel.js";

export const createNotification = async (req, res) => {
  try {
    const { userId, type, message } = req.body;
    const notification = await Notification.create({ userId, type, message });

    res.status(201).json({
      message: "Notification created",
      notification,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
