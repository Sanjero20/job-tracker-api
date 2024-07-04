import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/pool';
import { generateToken } from '../utils/token';

import { verifyToken } from '../middlewares/verifyToken';
import { validateAuthInput } from '../middlewares/validateInput';

const router = express.Router();

router.post(
  '/register',
  validateAuthInput,
  async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      const accounts = await pool.query(
        'SELECT * FROM accounts WHERE email = $1',
        [email]
      );

      // Prevent from continuing the registration process if email is already registered
      if (accounts.rows.length != 0) {
        return res.status(401).json({ message: 'Email already exists' });
      }

      // Encrypt password before inserting to database
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);

      const newUser = await pool.query(
        'INSERT INTO accounts(name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email, encryptedPassword]
      );

      const token = generateToken(newUser.rows[0].user_id);
      res.json({ token });
    } catch (error) {
      console.error('Server Error', error);
      res.status(500).send('Server Error');
    }
  }
);

router.post(
  '/login',
  validateAuthInput,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const account = await pool.query(
        'SELECT * FROM accounts WHERE email = $1',
        [email]
      );

      if (account.rows.length === 0) {
        return res.status(401).send({ message: 'Account does not exist' });
      }

      const validPassword = await bcrypt.compare(
        password,
        account.rows[0].password
      );

      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(account.rows[0].user_id);
      res.json({ token });
    } catch (error) {
      console.error('Server Error', error);
      res.status(500).send('Server Error');
    }
  }
);

router.post('/verify', verifyToken, async (req: any, res: any) => {
  const user_id = req.user.id;

  const query = `SELECT name, email FROM accounts WHERE user_id = $1`;
  const value = [user_id];

  try {
    const result = await pool.query(query, value);
    const { name, email } = result.rows[0];
    res.json({ isLoggedIn: true, name, email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
