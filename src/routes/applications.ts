import express, { Request, Response } from 'express';
import { pool } from '../config/pool';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const data = await pool.query(`SELECT * FROM job_applications`);
  const applications = data.rows;

  res.json({
    applications,
  });
});

router.post('/', async (req: Request, res: Response) => {
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

export default router;
