import express, { Response, query } from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { pool } from '../config/pool';

const router = express.Router();

// Get all applications where in the status is in progress
router.get('/', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;

  const query = `
  SELECT
    ji.id,
    ja.id AS job_id,
    ja.status,
    ja.company_name,
    ja.position,
    COALESCE(TO_CHAR(ji.schedule, 'YYYY-MM-DD'), '') AS schedule,
    ji.interviewed
  FROM
    job_applications ja
  LEFT JOIN 
    job_interviews ji ON ja.id = ji.job_id
  WHERE
    ja.user_id = $1 AND ja.status IN ('In Progress', 'Interviewed', 'Not Selected', 'Offered')
  ORDER BY schedule
`;
  const value = [user_id];

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
  const { job_id, schedule } = req.body;

  // Check first if there is already a scheule
  const rowData = await pool.query(
    'SELECT * FROM job_interviews WHERE job_id = $1',
    [job_id]
  );

  let query = '';
  let values = [];

  if (rowData.rows.length > 0) {
    query = `UPDATE job_interviews SET schedule = $1 WHERE user_id = $2 AND job_id = $3`;
    values = [schedule, user_id, job_id];
  } else {
    query = `INSERT INTO job_interviews (user_id, job_id, schedule) VALUES ($1, $2, $3) RETURNING *`;
    values = [user_id, job_id, schedule];
  }

  try {
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/:id', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;
  const job_id = req.params['id'];
  const { interviewed, status } = req.body;

  const query1 = `UPDATE job_interviews SET interviewed = $1 WHERE job_id = $2 AND user_id = $3`;
  const value1 = [interviewed, job_id, user_id];

  const query2 = `UPDATE job_applications set status = $1 WHERE id = $2 AND user_id = $3`;
  const value2 = ['Interviewed', job_id, user_id];

  try {
    await pool.query(query1, value1);

    // Change status from in progress to interviewed if mark as done
    if (interviewed && status == 'In Progress') {
      await pool.query(query2, value2);
    }
    res.status(201).json('Successfully updated');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server error' });
  }
});

export default router;
