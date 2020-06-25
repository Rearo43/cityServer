'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT;
const app = express();


app.use(cors());

app.get('/', (req, resp) =>{
  resp.status(200).send('Working?');
});

app.get('/location', (req, resp)=>{
  let data = require('./data/location.json');
  let newData = new Location(data[0]);

  resp.status(200).json(newData);

  const API = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE}&q=${req.query.city}&format=json`;

  superagent.get(API).then(data => {
    let location = new Location(data.body[0],req.query.city);
    resp.status(200).json(location);
  });

});

function Location(location, city) {
  this.latitude = location.lat;
  this.longitude = location.lon;
  this.formatted_query = location.display_name;
  this.search_query = city;
}


app.get('/weather', (req, resp)=>{
  let weatherData = require('./data/weather.json');
  let data = weatherData.data;
  resp.status(200).json(weather(data));
});

const weather = (arr) => {

  let findForecast = arr.map(weatherObj =>{
    let findWeath = new Weather(weatherObj);
    return findWeath;
  });

  return findForecast;
};

function Weather(api) {
  this.forecast = api.weather.description;
  let result = new Date(api.valid_date);
  this.time = result.toDateString();
}

app.get('/restaurants', (req, resp)=>{
  let data = require('./data/weather.json');
  let allRestaurants = [];

  data.nearby_restaurants.forEach(restObj => {
    let findRestaurants = new Restaurant(restObj);
    allRestaurants.push(findRestaurants);
  });

  resp.status(200).json(allRestaurants);
});

function Restaurant(api) {
  this.cuisines = api.restaurant.cuisines;
  this.restaurant = api.restaurant.name;
  this.locality = api.restaurant.location.locality_verbose;
}

app.use('*', (req, resp)=>{
  resp.status(404).send('Can not find!');
});

app.use((error,req, resp, next)=>{
  resp.status(500).send('Broken!');
});

app.listen(PORT, () => console.log('Working on', PORT));

