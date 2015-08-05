var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var config = require('./config');
var Client = require('../payme/client');


function initClient(req, res, next) {
    req.client = new Client(config, config.apiUrl, req.cookies.token || req.query.token);
    req.client.setUserAgent(req.get('User-Agent'));
    next();
}


function initDevice(req, res, next) {
    var deviceId = req.cookies.device;
    if (deviceId) {
        req.client.setDeviceId(deviceId);
        next();
        return;
    }
    
    req.client.devices.current().then(function(device) {
        var expires = new Date(Date.now() + config.auth.deviceTtlMs);
        req.client.setDeviceId(device.id);
        res.cookie('device', device.id, {expires: expires});
        
        next();
    }).catch(function (error) {
        next(error);
    });
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
router.use(initDevice);
router.use(authToken);

module.exports = router;
