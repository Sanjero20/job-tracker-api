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
      const { email, password, first_name, last_name } = req.body;

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
        'INSERT INTO accounts(email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *',
        [email, encryptedPassword, first_name, last_name]
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
        return res
          .status(401)
          .send({ message: 'Account not found in database' });
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

router.post('/verify', verifyToken, (req: any, res: any) => {
  try {
    res.json({ isLoggedIn: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
