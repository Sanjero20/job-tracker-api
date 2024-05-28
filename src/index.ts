import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Routes
import authRoutes from './routes/authentication';
import applicationRoutes from './routes/applications';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.get('/', (req: Request, res: Response) => {
  res.send('Backend api for job tracker app');
});

app.use('/auth', authRoutes);
app.use('/applications', applicationRoutes);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
