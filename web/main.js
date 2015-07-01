var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();


// Configuration
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'jade');


// Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());


// Static routes
app.use('/public', express.static(__dirname + '/../public'));


// Application routes
app.use(require('./index'));
app.use(require('./invoices'));
require('./errors')(app);


// Run the server.
var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Web server is listening on %s:%s', host, port);
});
