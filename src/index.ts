import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

import { pool } from './config/pool';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

const TABLE_NAME = 'job_application';

app.get('/', (req: Request, res: Response) => {
  res.send('Backend api for job tracker app');
});

app.get('/applications', async (req: Request, res: Response) => {
  const data = await pool.query(`SELECT * FROM ${TABLE_NAME}`);

  const applications = data.rows;

  res.json({
    values: applications,
  });
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
