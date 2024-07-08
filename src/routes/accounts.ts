import express, { Request, Response } from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { pool } from '../config/pool';

const router = express.Router();

//
router.post('/', verifyToken, async (req: any, res: Response) => {});

// Delete all user data
router.delete('/data', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;

  const query = 'DELETE FROM job_applications WHERE user_id = $1';
  const value = [user_id];

  try {
    await pool.query(query, value);
    res.status(204).json({ message: 'Successfully deleted user data' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete account
router.delete('/user', verifyToken, async (req: any, res: Response) => {});

export default router;
