var express = require('express');
var logger = require('morgan');
var path = require('path');
var app = express();
var config = require('./config');


// Configuration
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'jade');
app.locals.config = config;
app.use(logger('dev'));


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
