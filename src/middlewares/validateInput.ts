import { NextFunction } from 'express';

export function validateAuthInput(req: any, res: any, next: NextFunction) {
  const { email, password } = req.body;

  const isValid = validateEmail(email);
  if (!isValid) {
    res.status(400).json({ message: 'Invalid email' });
    return;
  }

  if (!email || !password) {
    res.status(400).json({ message: 'Missing inputs' });
    return;
  }

  next();
}

const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
