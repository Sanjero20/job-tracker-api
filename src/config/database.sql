-- setup schema

CREATE TABLE job_application
(
  id SERIAL PRIMARY KEY,
  status VARCHAR(50),
  position VARCHAR(100),
  company_name VARCHAR(255) NOT NULL,
  min_compensation INTEGER DEFAULT NULL,
  max_compensation INTEGER DEFAULT NULL,
  setup VARCHAR(50) CHECK (setup IN ('remote', 'on-site', 'hybrid')),
  application_date DATE DEFAULT CURRENT_DATE,
  job_site VARCHAR(100) NOT NULL,
  job_link TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
