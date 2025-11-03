// socket.js
import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // allow all origins during development
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // User joins their personal room (for direct notifications)
    socket.on("joinUser", (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined personal notification room`);
    });

    // Join a group chat room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`🏠 User joined group room: ${roomId}`);
    });

    // Receive & broadcast chat messages
    socket.on("sendMessage", (data) => {
      const { roomId, sender, message } = data;
      io.to(roomId).emit("receiveMessage", {
        sender,
        message,
        time: new Date(),
      });
    });

    // Send notifications
    socket.on("sendNotification", (data) => {
      const { userId, type, message } = data;
      io.to(userId).emit("receiveNotification", { type, message, time: new Date() });
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });

  return io;
};

// Export for controllers
export const getIo = () => io;
