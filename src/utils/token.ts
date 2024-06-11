import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function generateToken(user_id: string) {
  const payload = {
    user: { id: user_id },
  };

  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_SECRET_LIFE;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in env file');
  }

  try {
    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    console.error('Error generating JWT', error);
    throw new Error('Token generation failed');
  }
}
