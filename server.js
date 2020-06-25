'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;

const app = express();

app.use(cors());

app.get('/location', (req, resp) =>{
  let dataLocation = req('./data/location.json');
  let newData = new Location(dataLocation[0]);

  resp.status(200).json(newData);

});

function Location(info, city){
  this.latitude = info.lat;
  this.logitude = info.lon;
  this.formatting_query = info.display_name;
  this.search_query = city;

}

app.use('*', (req,resp) => {
  resp.status(404).send('Could Not Find!');
});

app.use((error, req, resp, next) => {
  console.log(error);
  resp.status(500).send('Broken Server!');
});

app.listen( PORT, () => console.log('Working?', PORT));









