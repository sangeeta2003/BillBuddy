import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectionDB from './config/db.js';
import userRouter from './routes/userRoutes.js';
import groupRouter from './routes/groupRoutes.js';
import expenseRouter from './routes/expenseRoutes.js'
import balanceRouter from "./routes/balanceRoutes.js";
import settlementRoutes from "./routes/settlementRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";



// Load environment variables
dotenv.config();

// Create express app
const app = express();

// Connect to MongoDB
connectionDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/user', userRouter);
app.use('/api/group',groupRouter);
app.use('/api/expense',expenseRouter);
app.use("/api/balance", balanceRouter);
app.use("/api/settle", settlementRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('BillBuddy API is running...');
});

export default app;
