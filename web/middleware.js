var express = require('express');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var config = require('./config');
var Client = require('../client');


function initClient(req, res, next) {
    req.client = new Client(config, config.apiUrl, req.cookies.token);
    next();
}

var router = express.Router();

router.use(logger('dev'));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());
router.use(initClient);

module.exports = router;