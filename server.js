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

// listen for requests
app.listen(PORT, () => console.log('Listening on port:', PORT));

// API Routes
app.get('/', (request, response) => {
  // test out your routes, perhaps ejs views or database stuff
  response.render('pages/index');
});

function Weather (weatherDataResults) {
  //   this.searchQuery = searchQuery;
  this.forecast = weatherDataResults.summary;
  this.icon = weatherDataResults.icon;
  this.time = new Date(weatherDataResults.time * 1000).toDateString();
  this.tempHigh = Math.floor(weatherDataResults.temperatureHigh);
  this.tempLow = Math.floor(weatherDataResults.temperatureLow);
  this.percentPrecip = weatherDataResults.precipProbability * 100;
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
  this.url = eventResults.htmlLink
}

// const start = event.start.dateTime || event.start.date;
//         console.log(`${start} - ${event.summary}`);


// -------------------Google Calendar API ----------------------------
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Calendar API.
  authorize(JSON.parse(content), listEvents);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    console.log(events);
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        console.log(new Event(event));
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
}


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
      dailyResults.map(day => {
        console.log(new Weather(day))
      })
    })
    .catch(err =>{
      console.log(err);
    })
}

newsAPIcall();
weatherAPICall();
