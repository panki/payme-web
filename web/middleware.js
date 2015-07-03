var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var config = require('./config');
var Client = require('../client');


function initClient(req, res, next) {
    req.client = new Client(config, config.apiUrl, req.cookies.token || req.query.token);
    next();
}


function authToken(req, res, next) {
    if (req.query.token) {
        req.client.tokens.authorize(req.query.token).then(function (session) {
            res.locals.session = session;
            res.locals.session_json = JSON.stringify({
                id: session.id,
                account_id: session.account_id
            });
            next();
        }).catch(function (e) {
            next(e)
        });
    } else {
        next();    
    }
}


var router = express.Router();

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());
router.use(initClient);
router.use(authToken);

module.exports = router;
