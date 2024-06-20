import express, { Request, Response } from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { pool } from '../config/pool';

import moment from 'moment';

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

router.get('/activity', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;

  const query = `
    SELECT 
      TO_CHAR(application_date, 'YYYY-MM-DD') AS date, 
      COUNT(*)::int as count,
      CASE
        WHEN COUNT(*) BETWEEN 1 AND 3 THEN 1
        WHEN COUNT(*) BETWEEN 4 AND 6 THEN 2 
        WHEN COUNT(*) BETWEEN 7 AND 9 THEN 3 
        ELSE 4
      END AS level
    FROM job_applications
    WHERE user_id = $1 
    GROUP BY application_date
  `;
  const values = [user_id];

  const currentDate = new Date();
  const lastYear = currentDate.getFullYear() - 1;

  const endDate = {
    date: moment(currentDate).format('YYYY-MM-DD'),
    count: 0,
    level: 0,
  };

  const startDate = {
    date: moment(currentDate.setFullYear(lastYear)).format('YYYY-MM-DD'),
    count: 0,
    level: 0,
  };

  try {
    const data = await pool.query(query, values);
    res.status(200).json([startDate, endDate, ...data.rows]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
  //
});

export default router;
