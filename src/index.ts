import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

import { pool } from './config/pool';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

const TABLE_NAME = 'job_applications';

app.get('/', (req: Request, res: Response) => {
  res.send('Backend api for job tracker app');
});

app.get('/job-applications', async (req: Request, res: Response) => {
  const data = await pool.query(`SELECT * FROM ${TABLE_NAME}`);
  const applications = data.rows;

  res.json({
    job_applications: applications,
  });
});

app.post('/job-applications', async (req: Request, res: Response) => {
  const {
    status,
    position,
    company_name,
    min_compensation,
    max_compensation,
    setup,
    job_site,
    job_link,
    note,
  } = req.body;

  const query = `
    INSERT INTO job_application (status, position, company_name, min_compensation, max_compensation, setup, job_site, job_link, note)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

  const values = [
    status,
    position,
    company_name,
    min_compensation,
    max_compensation,
    setup,
    job_site,
    job_link,
    note,
  ];

  try {
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Job application added to list' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
