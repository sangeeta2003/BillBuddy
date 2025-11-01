import express from 'express';
import dotenv from 'dotenv';
import connectionDB from './config/db.js';


dotenv.config();
const app = express();
connectionDB();

app.use(express.json());

export default app;

