'use strict'

// Application Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent')

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));
// Specify a directory for static resources
app.use(express.static('./public'));

// Database Setup: if you've got a good DATABASE_URL
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');

//Method Override
const methodOverride = require('method-override');

app.use(methodOverride ((request, response) => {
  if(request.body && typeof request.body === 'object' && '_method' in request.body){
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

//Globals
let currentNewsArray = [];



function Weather (weatherDataResults) {
  //   this.searchQuery = searchQuery;
  this.forecast = weatherDataResults.summary;
  this.icon = weatherDataResults.icon;
  this.time = new Date(weatherDataResults.time * 1000).toDateString();
  this.tempHigh = Math.floor(weatherDataResults.temperatureHigh);
  this.tempLow = Math.floor(weatherDataResults.temperatureLow);
  this.percentPrecip = Math.floor(weatherDataResults.precipProbability * 100);
  this.averageTemp = Math.floor((this.tempHigh+this.tempLow)/2);
  this.img_url = '';
}

Weather.prototype.textToIcon = function() {
  switch (this.icon) {
  case 'partly-cloudy-day':
    this.img_url = 'https://i.imgur.com/zeRtVvS.png'
    break;
  case 'clear-night':
    this.img_url = 'https://i.imgur.com/a4VnSLD.png'
    break;
  case 'snow':
    this.img_url = 'https://i.imgur.com/vLYjL0m.png'
    break;
  case 'wind':
    this.img_url = 'https://i.imgur.com/rblW3u0.png'
    break;
  case 'sleet':
    this.img_url = 'https://i.imgur.com/NOwnviA.png'
    break;
  case 'fog':
    this.img_url = 'https://i.imgur.com/h6O7owv.png'
    break;
  case 'rain':
    this.img_url = 'https://i.imgur.com/8FsbOim.png'
    break;
  case 'cloudy':
    this.img_url = 'https://i.imgur.com/rblW3u0.png'
    break;
  case 'clear-day':
    this.img_url = 'https://i.imgur.com/5XpmW64.png'
    break;

  default:
    break;
  }
}

function News (newsResults, index) {
  this.source = newsResults.source.id;
  this.author = newsResults.author;
  this.title = newsResults.title;
  this.description = newsResults.description;
  this.url = newsResults.url;
  this.imgurl = newsResults.urlToImage;
  this.id = index;
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
  return superagent.get(url)
    .then(superagentResults => {
      let newsResults = superagentResults.body.articles;
      currentNewsArray = newsResults.map((article, index) => new News(article, index));
      // console.log('newNews: ',newNews);
      // console.log('news', currentNewsArray.length);
      return currentNewsArray;
    });
}

function renderSavedNews(req, res){
  let sql = 'SELECT * FROM news;';
  client.query(sql).then(sqlResults => {
    return(sqlResults.rows);

  })

}


//----------------DarkSky API-----------------------------
function weatherAPICall(req, res){
  let url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${47.618042},${-122.3362818}`
  return superagent.get(url)
    .then(superagentResults => {
      let dailyResults = superagentResults.body.daily.data;
      let weatherArray = dailyResults.map(day => {
        let newDay = new Weather(day);
        newDay.textToIcon();
        return newDay;
      })
      // console.log('weather array: ', weatherArray);
      // console.log('weather', weatherArray.length);
      return weatherArray;
    })
    .catch(err =>{
      console.log(err);
    })
}

// -----------------Promise API--------------------

app.get('/show',(req, res)=> {
  // Shows detailed view of clicked book

  // Query database
  Promise.all([
    newsAPIcall(req, res),
    weatherAPICall(req, res),
    renderSavedNews(req, res)
  ])
    .then(resultsArr => {
      console.log('All results: ', resultsArr);
      res.render('pages/show', {
        weatherArray: resultsArr[1],
        newNews: resultsArr[0],
        savedNews: resultsArr[2]
      });
    })
    .catch(err => console.error(err));
});

// Routes
app.get('/', (request, response) => {
  response.render('pages/index');
});

app.post('/save/:search_id', (req, res) => {
  let currentIndex = req.params.search_id;
  let {source, author, title, description, url, imgurl} = currentNewsArray[currentIndex];
  let sql = 'INSERT INTO news (source, author, title, description, url, imgurl) VALUES ($1, $2, $3, $4, $5, $6);';
  let values = [source, author, title, description, url, imgurl];
  console.log(values);
  client.query(sql, values)
    .then(sqlResults =>{
      console.log(`Saved news article #${currentIndex}`);
      // res.redirect('pages/show')
    })

    .catch(err => console.error(err))
})


app.use('*', (req, res) => res.status(404).send('This route does not exist.'));


// newsAPIcall();
// weatherAPICall();
// listen for requests
app.listen(PORT, () => console.log('Listening on port:', PORT));
