// socket.js
import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CORS_ORIGIN || "*" 
      : "*",
    methods: ["GET", "POST"],
    credentials: true,
  };

  io = new Server(server, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // User joins their personal room (for direct notifications)
    socket.on("joinUser", (userId) => {
      if (!userId) {
        socket.emit("error", { message: "User ID is required" });
        return;
      }
      socket.join(userId);
      console.log(`👤 User ${userId} joined personal notification room`);
    });

    // Join a group chat room
    socket.on("joinRoom", (roomId) => {
      if (!roomId) {
        socket.emit("error", { message: "Room ID is required" });
        return;
      }
      socket.join(roomId);
      console.log(`🏠 User joined group room: ${roomId}`);
    });

    // Leave a group chat room
    socket.on("leaveRoom", (roomId) => {
      if (roomId) {
        socket.leave(roomId);
        console.log(`🚪 User left group room: ${roomId}`);
      }
    });

    // Receive & broadcast chat messages
    socket.on("sendMessage", (data) => {
      try {
        const { roomId, sender, message } = data;
        if (!roomId || !sender || !message) {
          socket.emit("error", { message: "Missing required fields" });
          return;
        }
        io.to(roomId).emit("receiveMessage", {
          sender,
          message,
          time: new Date(),
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Send notifications
    socket.on("sendNotification", (data) => {
      try {
        const { userId, type, message } = data;
        if (!userId || !type || !message) {
          socket.emit("error", { message: "Missing required fields" });
          return;
        }
        io.to(userId).emit("receiveNotification", { type, message, time: new Date() });
      } catch (error) {
        console.error("Error sending notification:", error);
        socket.emit("error", { message: "Failed to send notification" });
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });

  return io;
};

// Export for controllers
export const getIo = () => io;
