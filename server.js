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
app.get('/hiking', hiking);

function home(req, resp){
    resp.status(200).send('Working?');
}

function location(req, resp){
    useAPI(req.query.city, resp);
}

function useAPI(city, resp){
    const API = 'https://us1.locationiq.com/v1/search.php';

    let qObject = {
        key: process.env.GEOCODE_API_KEY,
        q: city,
        format: 'json'
    };

    superagent.get(API).query(qObject).then(location =>{
        let newLocation = new Location(location.body[0], city);

        resp.status(200).send(newLocation);

    }).catch(() =>{
        resp.status(500).send('Location Broken!');
    });

}

function Location(each, city){
    this.latitude = each.lat;
    this.longitude = each.lon;
    this.formatted_query = each.display_name;
    this.search_query = city;
}
function weather(req, resp){

}
function hiking(req, resp){

}

// app.get('/weather', (req, resp)=>{
// 	let weatherData = require('./data/weather.json');
// 	let data = weatherData.data;
// 	resp.status(200).json(weather(data));
// });

// const weather = (arr) => {

// 	let findForecast = arr.map(weatherObj =>{
// 		let findWeath = new Weather(weatherObj);
// 		return findWeath;
// 	});

// 	return findForecast;
// };

// function Weather(api) {
// 	this.forecast = api.weather.description;
// 	let result = new Date(api.valid_date);
// 	this.time = result.toDateString();
// }

app.use('*', (req, resp)=>{
    resp.status(404).send('Can not find!');
});

app.use((error,req, resp, next)=>{
    resp.status(500).send('Broken!');
});

app.listen(PORT, () => console.log('Working on', PORT));





