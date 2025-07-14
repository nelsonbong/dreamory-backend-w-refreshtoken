import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import publicEventRoutes from './routes/publicEvent.routes';
import sessionRoutes from './routes/session.routes'; // 👈 import remains the same

import prisma from './config/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use('/auth', userRoutes);             // for login/register
app.use('/session', sessionRoutes);          // for refresh-token and logout
app.use('/events', eventRoutes);
app.use('/public-events', publicEventRoutes);

app.get('/', async (req, res) => {
  try {
    await prisma.$connect();
    res.send('✅ Express is running and connected to the database successfully!');
  } catch (err) {
    res.status(500).send('❌ Express is running but failed to connect to the database.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
