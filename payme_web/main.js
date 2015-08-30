var express = require('express');
var logger = require('morgan');
var path = require('path');
var app = express();
var config = require('./config');


// Configuration
app.set('views', [path.join(__dirname, 'templates'), path.join(__dirname, '../payme/emails/templates')]);
app.set('view engine', 'jade');
app.set('trust proxy', config.proxies);
app.locals.config = config;
app.locals.numeral = require('../payme/numeral');
app.locals.moment = require('../payme/moment');
app.locals.cards = require('../payme/cards');
app.use(logger('combined'));


// Middleware
app.use('/public', express.static(__dirname + '/../public'));
app.use(require('./middleware.js'));


// Routes
app.use(require('./index'));
app.use(require('./invoices'));
app.use(require('./emails'));
app.use(require('./mandrill'));
require('./errors')(app);


// Run the server.
var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Web server is listening on %s:%s', host, port);
});
