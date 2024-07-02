CREATE DATABASE job_tracker;

CREATE TABLE accounts
(
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE job_applications
(
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES accounts(user_id) ON DELETE CASCADE,
  status VARCHAR(50),
  position VARCHAR(100),
  company_name VARCHAR(255) NOT NULL,
  min_compensation INTEGER DEFAULT NULL,
  max_compensation INTEGER DEFAULT NULL,
  setup VARCHAR(50) CHECK (setup IN ('remote', 'onsite', 'hybrid')),
  application_date DATE DEFAULT CURRENT_DATE,
  site VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_interviews
(
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES accounts(user_id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES job_applications(id) ON DELETE CASCADE,
  schedule DATE DEFAULT NULL,
  link TEXT DEFAULT NULL
);