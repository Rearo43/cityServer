'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT;
const app = express();


app.use(cors());

// Routes
app.get('/', home);
app.get('/location', location);
app.get('/weather', weather);
// app.get('/hiking', hiking);

function home(req, resp){
  resp.status(200).send('Working?');
}

function location(req, resp){
  useAPI(req.query.city, resp);
}

function useAPI(city, resp){
  const API = 'https://us1.locationiq.com/v1/search.php';

  let qObject = {
    key: process.env.GEOCODE,
    q: city,
    format: 'json'
  };

  superagent.get(API).query(qObject)
    .then(location =>{
      let newLocation = new Location(location.body[0], city);

      resp.status(200).send(newLocation);

    }).catch(() =>resp.status(500).send('Location Broken!'));

}

function Location(info, city){
  this.latitude = info.lat;
  this.longitude = info.lon;
  this.formatted_query = info.display_name;
  this.search_query = city;
}

function weather(req, resp){
  let dataWeather = require('./data/weather.json');
  let weatherArr =
    dataWeather.data.map(dayData => {
      let weather = new Weather(dayData);

      return weather;
    });

  resp.status(200).json(weatherArr);
}

function Weather(info){
  let getDate = new Date(info.datetime);

  this.forecast = info.weather.description;
  this.time = getDate.toDateString();
}

app.use('*', (req,resp) => {
  resp.status(404).send('Could Not Find!');
});

app.use((error, req, resp, next) => {
  // console.log(error);
  resp.status(500).send('Broken Server!');
});

app.listen( PORT, () => console.log('Working?', PORT));

