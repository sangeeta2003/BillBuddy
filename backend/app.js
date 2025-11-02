import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectionDB from './config/db.js';
import userRouter from './routes/userRoutes.js';
import groupRouter from './routes/groupRoutes.js'

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

// Default route
app.get('/', (req, res) => {
  res.send('BillBuddy API is running...');
});

export default app;
