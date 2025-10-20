
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.js';
import observationRoutes from './src/routes/observations.js';
import adminRoutes from './src/routes/admin.js';
import pool from './src/db.js';

dotenv.config();
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.send('Plant Observation Database System Backend'));

app.use('/api/auth', authRoutes);
app.use('/api/observations', observationRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
