'use strict'

// Application Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent')

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3001;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));
// Specify a directory for static resources
app.use(express.static('./public'));

// Database Setup: if you've got a good DATABASE_URL
if (process.env.DATABASE_URL) {
  const client = new pg.Client(process.env.DATABASE_URL);
  client.connect();
  client.on('error', err => console.error(err));
}

// Set the view engine for server-side templating
app.set('view engine', 'ejs');



function Weather (weatherDataResults) {
  //   this.searchQuery = searchQuery;
  this.forecast = weatherDataResults.summary;
  this.icon = weatherDataResults.icon;
  this.time = new Date(weatherDataResults.time * 1000).toDateString();
  this.tempHigh = Math.floor(weatherDataResults.temperatureHigh);
  this.tempLow = Math.floor(weatherDataResults.temperatureLow);
  this.percentPrecip = Math.floor(weatherDataResults.precipProbability * 100);
  this.averageTemp = Math.floor((this.tempHigh+this.tempLow)/2);
}

function News (newsResults) {
  this.source = newsResults.source.id;
  this.author = newsResults.author;
  this.title = newsResults.title;
  this.description = newsResults.description;
  this.url = newsResults.url;
  this.imgurl = newsResults.urlToImage;
}

function Event (eventResults){
  this.title = eventResults.summary;
  this.start = eventResults.start.dateTime || eventResults.start.date;
  this.end = eventResults.end.dateTime || eventResults.end.date;
  this.url = eventResults.htmlLink;
}

// const start = event.start.dateTime || event.start.date;
//         console.log(`${start} - ${event.summary}`);


//------------------Click Function------------------------








//------------------News API.org -------------------------
function newsAPIcall(req, res){
  let url = 'https://newsapi.org/v2/top-headlines?' +
          'sources=bbc-news&' +
          `apiKey=${process.env.NEWS_API_KEY}`;
  superagent.get(url)
    .then(superagentResults => {
      let newsResults = superagentResults.body.articles;
      newsResults.map(article => {
        console.log(new News(article))
      })
    })
}


//----------------DarkSky API-----------------------------
function weatherAPICall(req, res){
  let url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${47.618042},${-122.3362818,15.04}`
  superagent.get(url)
    .then(superagentResults => {
      let dailyResults = superagentResults.body.daily.data;
      let weatherArray = dailyResults.map(day => {
        return new Weather(day);
      })
      console.log(weatherArray)
      res.render('pages/show', {weatherArray: weatherArray} );

    })
    .catch(err =>{
      console.log(err);
    })
}

// -----------------spotify API--------------------


// Routes
app.get('/', (request, response) => {
  response.render('pages/index');
});



app.get('/show', weatherAPICall);

app.use('*', (req, res) => res.status(404).send('This route does not exist.'));


newsAPIcall();
weatherAPICall();
// listen for requests
app.listen(PORT, () => console.log('Listening on port:', PORT));
