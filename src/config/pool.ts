import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const localConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: 'localhost',
  port: 5432,
};

const connectionString = process.env.POSTGRES_URL;
const config = connectionString ? { connectionString } : localConfig;

export const pool = new pg.Pool(config);
