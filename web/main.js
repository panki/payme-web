var express = require('express');
var path = require('path');
var app = express();

// view engine setup

app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

// routes

app.use(require('./middleware.js'));
app.use('/', require('./index'));
app.use('/emails', require('./emails'));

// error handlers

require('./errors')(app);

module.exports = app;
