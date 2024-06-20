import express, { Request, Response } from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { pool } from '../config/pool';

const router = express.Router();

// Overview
router.get('/overview', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;

  // get all applications from a user
  const query = `
  SELECT 
      COUNT(*) FILTER (WHERE status = 'In Progress') AS ongoing,
      COUNT(*) FILTER (WHERE status = 'Offered') AS offered,
      COUNT(*) FILTER (WHERE status = 'Not Selected') AS rejected,
      COUNT(*) AS total
  FROM job_applications WHERE user_id = $1`;

  const values = [user_id];

  try {
    const data = await pool.query(query, values);
    res.status(200).json(data.rows[0]);
    //
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/status', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;

  const query =
    'SELECT status AS name, COUNT(*)::int AS count FROM job_applications WHERE user_id = $1 GROUP BY status';
  const values = [user_id];

  try {
    const distribution = [
      { name: 'Applied', count: 0 },
      { name: 'In progress', count: 0 },
      { name: 'Interviewed', count: 0 },
      { name: 'Not Selected', count: 0 },
      { name: 'Offered', count: 0 },
    ];

    const data = await pool.query(query, values);
    const statuses = data.rows;

    statuses.forEach((row) => {
      const status = distribution.find(
        (s) => s.name.toLowerCase() === row.name.toLowerCase()
      );
      if (status) {
        status.count = row.count;
      }
    });

    res.status(200).json(distribution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
