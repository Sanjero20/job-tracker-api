import express, { Request, Response } from 'express';
import { pool } from '../config/pool';
import { verifyToken } from '../middlewares/verifyToken';

const router = express.Router();

// Get all job applications by user id
router.get('/', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;

  const data = await pool.query(
    `SELECT * FROM job_applications WHERE user_id = $1 ORDER BY id`,
    [user_id]
  );

  const applications = data.rows;

  res.json({
    applications,
  });
});

// Add new job application
router.post('/', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;

  const {
    status,
    position,
    company_name,
    min_compensation,
    max_compensation,
    setup,
    site,
    url,
    note,
  } = req.body;

  const query = `
    INSERT INTO job_applications (user_id, status, position, company_name, min_compensation, max_compensation, setup, site, url, note)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;

  const values = [
    user_id,
    status,
    position,
    company_name,
    min_compensation,
    max_compensation,
    setup,
    site,
    url,
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

// Update status by id
router.put('/:id', verifyToken, async (req: any, res: any) => {
  const id = req.params['id'];
  const { status } = req.body;

  const query = 'UPDATE job_applications SET status = $1 WHERE id = $2';
  const values = [status, id];

  try {
    const response = await pool.query(query, values);
    res.status(201).json({ message: 'Successfully updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete by job_id
router.delete('/:id', verifyToken, async (req: any, res: any) => {
  const user_id = req.user.id;
  const id = req.params['id'];

  const query = 'DELETE FROM job_applications WHERE user_id = $1 AND id = $2';
  const values = [user_id, id];

  try {
    await pool.query(query, values);
    res.status(200).json({ message: 'Successfully deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete all
router.delete('/all', verifyToken, async (req: any, res: any) => {
  const user_id = req.user.id;

  const query = 'DELETE FROM job_applications WHERE user_id = $1';
  const value = [user_id];

  try {
    await pool.query(query, value);
    res.status(200).json({ message: 'Successfully deleted all applications' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
