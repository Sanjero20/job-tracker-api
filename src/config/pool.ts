import pg from 'pg';

const localConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'job_tracker',
  host: 'localhost',
  port: 5432,
};

const connectionString = process.env.POSTGRES_URL;
const config = connectionString ? { connectionString } : localConfig;

export const pool = new pg.Pool(config);
