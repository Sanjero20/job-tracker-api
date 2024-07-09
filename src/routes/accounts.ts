import express, { Request, Response } from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { pool } from '../config/pool';

const router = express.Router();

//
router.put('/user', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;
  const { name, email } = req.body;

  const query = 'SELECT * FROM accounts WHERE email = $1';
  const value = [email];

  const data = await pool.query(query, value);

  // Check if email already exist
  if (data.rows.length > 0 && user_id != data.rows[0].user_id) {
    return res.status(409).json({ message: 'This email already exist' });
  }

  // email is not bound to other user accounts
  if (data.rows.length == 0) {
  }

  try {
    const data = await pool.query(
      'UPDATE accounts SET name = $1, email = $2 WHERE user_id = $3 RETURNING *',
      [name, email, user_id]
    );

    res.status(201).json({
      message: 'Successfully updated account info',
      ...data.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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
router.delete('/user', verifyToken, async (req: any, res: Response) => {
  const user_id = req.user.id;

  const query = 'DELETE FROM accounts WHERE user_id = $1';
  const value = [user_id];

  try {
    await pool.query(query, value);
    res.status(204).json({ message: 'Successfully delete user account' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
