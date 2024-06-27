import express, { Response } from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { pool } from '../config/pool';

const router = express.Router();

// Get all applications where in the status is in progress
router.get('/', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;
  const status = 'In Progress';

  const query = `
  SELECT 
    ja.id AS application_id,
    ja.company_name,
    ja.position,
    COALESCE(TO_CHAR(ji.schedule, 'YYYY-MM-DD'), '') AS schedule,
    COALESCE(ji.link, '')  AS link
  FROM
    job_applications ja
  LEFT JOIN 
    job_interviews ji ON ja.id = ji.job_id
  WHERE
    ja.user_id = $1 AND ja.status = $2
`;
  const value = [user_id, status];

  try {
    const data = await pool.query(query, value);
    res.status(200).json(data.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server error' });
  }
});

router.post('/', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;
  const { job_id, schedule, link } = req.body;

  const query = `INSERT TO job_interviews (user_id, job_id, schedule, link) VALUES ($1, $2, $3, $4) RETURNING *`;
  const values = [user_id, job_id, schedule, link];

  try {
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
