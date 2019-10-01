DROP TABLE IF EXISTS news;

CREATE TABLE news(
  id SERIAL PRIMARY KEY,
  source VARCHAR(255),
  author VARCHAR(255),
  title VARCHAR(255),
  description TEXT
  url VARCHAR(255),
  imgurl VARCHAR(255),
);