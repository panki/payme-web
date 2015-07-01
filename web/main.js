var express = require('express');
var logger = require('morgan');
var path = require('path');
var app = express();

// view engine setup

app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'jade');
app.use(logger('dev'));

// routes

app.use(express.static(path.join(__dirname, 'public')));
app.use(require('./middleware.js'));
app.use('/', require('./index'));
app.use(require('./invoices'));
app.use(require('./emails'));

// error handlers

require('./errors')(app);

module.exports = app;
