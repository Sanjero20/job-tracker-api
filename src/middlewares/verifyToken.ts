import { NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function verifyToken(req: any, res: any, next: NextFunction) {
  const token = req.headers['authorization'].split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in env file');
    }

    const verify = jwt.verify(token, secret) as JwtPayload;
    req.user = verify.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}
