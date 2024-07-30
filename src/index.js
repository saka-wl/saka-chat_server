
const express = require('express');
const cookieParser = require('cookie-parser');

require('dotenv').config()
require("./db/init")

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/c/user', require('./controller/userController'))

