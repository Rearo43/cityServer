'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;

console.log('Working?', PORT);

const app = express();

app.use(cors());

app.get('/location', (req, resp) =>{
    let data = req('./data/location.json');
    let newData = new location(data[0]);

    response.status(200).json(newData);

});

function location(info){
    this.latitude = info.lat;
    this.logitude = info.lon;
    this.formatting_query = info.display_name
    
}

app.get('/weather', (req, resp) => {
    let data = require('./data/weather.json');
    
});










