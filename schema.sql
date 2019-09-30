DROP TABLE IF EXISTS events;

CREATE TABLE events(
  id SERIAL PRIMARY KEY,
  date DATE,
  name VARCHAR(255),
  start_time TIME,
  end_time TIME,
  location VARCHAR(255),
  description TEXT
);