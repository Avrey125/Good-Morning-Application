# Good-Morning-Application

Team Members: Avrey, Corey, Chris, Darrik
Description: This is a smart mirror that displays our heroku web application. The application displays the news, local weather, plays music, and saves your favorite news stories, all while also functioning as a mirror!
Problem Domain: We wanted to create a convenient application for a smart mirror using the apis neccessary for anyone in the morning.
the project solves this proble by displaying the local weather data, news stories, a spotify playlist, and saves ones favorite news stories

1.0.0: Final product

jquery,express,pg,ejs,superagent,dotenv
https://developers.google.com/calendar/quickstart/js
https://developer.spotify.com/documentation/web-api/
https://newsapi.org/
https://darksky.net/dev/account

1.Clone the repo
2.Npm install express,method override,pg,ejs,and dotenv
3.Create an env file and aquire all of the api keys
4.Create a database and run our schema.sql file
5.Create a heroku and require all of the api keys


Sample .env
PORT=3000
NEWS_API_KEY=['your key']
WEATHER_API_KEY=['your key']
ZIPCODE_API_KEY=['your key']
DATABASE_URL=['your key']


Database:

DROP TABLE IF EXISTS news;

CREATE TABLE news(
  id SERIAL PRIMARY KEY,
  source VARCHAR(255),
  author VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  url VARCHAR(255),
  imgurl VARCHAR(255)
);



