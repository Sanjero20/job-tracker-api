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
      COUNT(*) FILTER (WHERE status IN ('In Progress', 'Interviewed')) AS ongoing,
      COUNT(*) FILTER (WHERE status = 'Offered') AS offered,
      COUNT(*) FILTER (WHERE status = 'Not Selected') AS rejected,
      COUNT(*) AS total
  FROM job_applications WHERE user_id = $1`;

  const values = [user_id];

  try {
    const data = await pool.query(query, values);
    res.status(200).json(data.rows[0]);
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

interface IActivity {
  date: string;
  count: number;
  level: number;
}

router.get('/activity', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;

  const currentDate = new Date();
  const lastYear = currentDate.getFullYear() - 1;

  // Default starting and ending date
  const end = {
    date: moment(currentDate).format('YYYY-MM-DD'),
    count: 0,
    level: 0,
  };

  const start = {
    date: moment(currentDate.setFullYear(lastYear)).format('YYYY-MM-DD'),
    count: 0,
    level: 0,
  };

  const query = `
    SELECT 
      TO_CHAR(application_date, 'YYYY-MM-DD') AS date, 
      COUNT(*)::int as count,
      CASE
        WHEN COUNT(*) = 1 THEN 1
        WHEN COUNT(*) BETWEEN 2 AND 4 THEN 2 
        WHEN COUNT(*) BETWEEN 5 AND 6 THEN 3 
      ELSE 4
      END AS level
    FROM job_applications
    WHERE user_id = $1 AND application_date BETWEEN $2 AND $3
    GROUP BY application_date
  `;
  const values = [user_id, start.date, end.date];

  try {
    const data = await pool.query(query, values);
    const applications: IActivity[] = data.rows;

    if (applications.length <= 0) {
      return res.status(200).json([start, end]);
    }

    if (applications[0].date !== start.date) {
      applications.unshift(start);
    }

    if (applications[applications.length - 1].date !== end.date) {
      applications.push(end);
    }

    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
  //
});

router.get('/statistics', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;

  const query = `
  SELECT 
    CAST(COUNT(*) AS INTEGER) AS total,
    CAST(COUNT(*) FILTER (WHERE ji.interviewed) AS INTEGER) AS interviewed,
    CAST(COUNT(*) FILTER (WHERE ja.status='Not Selected') AS INTEGER) AS rejected 
  FROM job_interviews ji 
  RIGHT JOIN job_applications ja ON ja.id = ji.job_id
  WHERE ja.user_id = $1`;
  const value = [user_id];

  try {
    const result = await pool.query(query, value);

    const { total, interviewed, rejected } = result.rows[0];

    const interview_rate = Math.round((interviewed / total) * 100) || 0;
    const rejection_rate = Math.round((rejected / total) * 100) || 0;

    res.status(200).json({ interview_rate, rejection_rate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/interview-dates', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;

  const query = `SELECT schedule from job_interviews WHERE user_id = $1`;
  const value = [user_id];

  try {
    const result = await pool.query(query, value);
    const schedules = result.rows.map((sched) => sched.schedule);
    res.status(200).json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
