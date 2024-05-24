import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/pool';
import { generateToken } from '../utils/token';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const accounts = await pool.query(
      'SELECT * FROM accounts WHERE email = $1',
      [email]
    );

    // Prevent from continuing the registration process if email is already registered
    if (accounts.rows.length != 0) {
      res.status(401).json('Email already exists');
      return;
    }

    // Encrypt password before inserting to database
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO accounts(email, password) VALUES ($1, $2) RETURNING *',
      [email, encryptedPassword]
    );

    const token = generateToken(newUser.rows[0].user_id);
    return res.json({ token });
  } catch (error) {
    console.error('Server Error', error);
    res.status(500).send('Server Error');
  }
});

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  // Validate credentials
  // Return jwt token
});

export default router;
