import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Backend api for job tracker app');
});

app.listen(PORT, () => {
  console.clear();
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
