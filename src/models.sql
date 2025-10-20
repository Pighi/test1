
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(20) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  assigned_by INTEGER REFERENCES users(id),
  assigned_to INTEGER REFERENCES users(id),
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE observations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  assignment_id INTEGER REFERENCES assignments(id),
  plant_name VARCHAR(100),
  species VARCHAR(100),
  location VARCHAR(255),
  notes TEXT,
  observed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE measurements (
  id SERIAL PRIMARY KEY,
  observation_id INTEGER REFERENCES observations(id),
  metric_name VARCHAR(100),
  metric_value NUMERIC,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  observation_id INTEGER REFERENCES observations(id),
  url TEXT,
  public_id TEXT
);
