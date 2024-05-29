import express, { Request, Response } from 'express';
import { pool } from '../config/pool';
import { verifyToken } from '../middlewares/verifyToken';

const router = express.Router();

router.get('/', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;

  const data = await pool.query(
    `SELECT * FROM job_applications WHERE user_id = $1`,
    [user_id]
  );

  const applications = data.rows;

  res.json({
    applications,
  });
});

router.post('/', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;

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
    INSERT INTO job_applications (user_id, status, position, company_name, min_compensation, max_compensation, setup, job_site, job_link, note)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;

  const values = [
    user_id,
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
    res
      .status(201)
      .json({ message: 'Job application added to list', data: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
