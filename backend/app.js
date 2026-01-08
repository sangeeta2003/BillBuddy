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
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN || "*" 
    : "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/user', userRouter);
app.use('/api/group', groupRouter);
app.use('/api/expense', expenseRouter);
app.use("/api/balance", balanceRouter);
app.use("/api/settle", settlementRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// Debug middleware to log all requests
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Default route
app.get('/', (req, res) => {
  res.send('BillBuddy API is running...');
});

// Debug route to test API
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    routes: {
      groups: 'POST /api/group',
      users: 'POST /api/user/register',
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler - log the request for debugging
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found',
    method: req.method,
    path: req.path,
    availableRoutes: [
      'POST /api/user/register',
      'POST /api/user/signin',
      'POST /api/group (auth required)',
      'GET /api/group',
      'GET /api/group/user/:userId',
    ]
  });
});

export default app;
