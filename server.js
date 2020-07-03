'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const app = express();
const pg = require('pg');
const database = new pg.Client(process.env.DATABASE);


app.use(cors());

// Routes
app.get('/', home);
app.get('/location', location);
app.get('/weather', weather);
app.get('/trails', hiking);
app.get('/movies', movies);
app.get('/yelp', yelp);

database.connect().then(() =>{
  app.listen(PORT, () => console.log('Database working!'));

}).catch(err => {
  throw console.log('Database not working!', err.message);
});

function home(req, resp){
  resp.status(200).send('Working?');
}

function location(req, resp){
  const cityQuery = [req.query.city];
  const SQL = 'SELECT * FROM places WHERE search_query = $1;';

  database.query(SQL, cityQuery).then(data =>{

    if (data.rows[0]){
      let inSQL = new Location(data.rows[0], req.query.city);
      resp.status(200).send(inSQL);
      console.log(data.rows[0],req.query.city);
    } else{
      locationAPI(req.query.city, resp);
    }

  }).catch(() => resp.status(500).send('Location Broken!'));

}

function locationAPI(req, resp){
  const API = 'https://us1.locationiq.com/v1/search.php';

  let qObject = {
    key: process.env.GEOCODE,
    q: req,
    format: 'json'
  };

  superagent.get(API).query(qObject).then(getLocation =>{
    let newLocation = new Location(getLocation.body[0], req);

    cacheToDB(newLocation);

    resp.status(200).send(newLocation);

  }).catch(() =>resp.status(500).send('Location API Broken!'));

}

function Location(info, city){
  this.latitude = info.lat;
  this.longitude = info.lon;
  this.formatted_query = info.display_name;
  this.search_query = city;
}

function cacheToDB(places){
  const saveData = [places.formatted_query, places.latitude, places.longitude, places.search_query];
  const SQL = 'INSERT INTO places (formatted_query, latitude, longitude, search_query) VALUES ($1, $2, $3, $4) RETURNING *;';

  database.query(SQL, saveData);
}

function weather(req, resp){
  const API = 'https://api.weatherbit.io/v2.0/forecast/daily';

  let qObject = {
    key: process.env.WEATHER,
    lat: req.query.latitude,
    lon: req.query.longitude,
    days: 8
  };

  superagent.get(API).query(qObject).then(getWeather =>{
    let weatherArr =
      getWeather.body.data.map(dayData => {
        return new Weather(dayData);
      });

    resp.status(200).json(weatherArr);

  }).catch(() =>resp.status(500).send('Weather Broken!'));

}

function Weather(info){
  let getDate = new Date(info.datetime);

  this.forecast = info.weather.description;
  this.time = getDate.toDateString();
}

function hiking(req, resp){
  const API = 'https://www.hikingproject.com/data/get-trails';

  let qObject = {
    key: process.env.HIKING,
    lat: req.query.latitude,
    lon: req.query.longitude,
  };

  superagent.get(API).query(qObject)
    .then(getTrails =>{
      let hikingArr =
              getTrails.body.trails.map(trails => {

                return new Hiking(trails);
              });

      resp.status(200).json(hikingArr);

    }).catch(() =>resp.status(500).send('Hiking Broken!'));

}

function Hiking(info){
  this.name = info.name;
  this.location = info.location;
  this.length = info.length;
  this.stars = info.stars;
  this.star_votes = info.starVotes;
  this.summery = info.summery;
  this.conditions = info.conditionDetails;
  this.condition_date = info.conditionDate;
  this.condition_time = info.conditionDate;
  this.trail_url = info.url;
}

function movies(req, resp){
  const API = 'https://api.themoviedb.org/3/search/movie';

  let qObject = {
    api_key: process.env.MOVIES,
    query: req.query.search_query,
  };

  superagent.get(API).query(qObject)
    .then(getMovies =>{
      let moviesArr =
                getMovies.body.results.map(movie => {

                  return new Movies(movie);
                });

      resp.status(200).json(moviesArr);

    }).catch(() =>resp.status(500).send('Movies Broken!'));

}

function Movies(info){
  this.title = info.original_title;
  this.overview = info.overview;
  this.average_votes = info.vote_average;
  this.total_votes = info.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${info.poster_path}`;
  this.popularity = info.popularity;
  this.released_on = info.release_date;
}

function yelp(req, resp){
  const API = `https://api.yelp.com/v3/businesses/search`;

  let qObject = {
    term: 'restaurants',
    location: req.query.search_query,
    limit: 10
  };

  let key = {'Authorization': `Bearer ${process.env.YELP}`};

  superagent.get(API).set(key).query(qObject)
    .then(getYelp =>{
      let yelpArr =
              getYelp.body.businesses.map(yelpData => {
                return new Yelp(yelpData);
              });

      resp.status(200).json(yelpArr);

    }).catch(() =>resp.status(500).send('Yelp Broken!'));

}

function Yelp(info){
  this.name = info.name;
  this.image_url = info.image_url;
  this.price = info.price;
  this.rating = info.rating;
  this.url = info.url;
}

app.use('*', (req,resp) => {
  resp.status(404).send('Could Not Find!');
});

app.use((error, req, resp, next) => {
  resp.status(500).send('Broken Server!');
});


