'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;

console.log('Working?', PORT);

const app = express();



