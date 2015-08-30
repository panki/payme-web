var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var config = require('./config');
var Client = require('../payme/client');

function initConfig(req, res, next) {
    res.locals.config = config;
    next();
}

function initClient(req, res, next) {
    req.client = new Client(config, config.apiUrl, req.cookies.token || req.query.token);
    req.client.setUserAgent(req.get('User-Agent'));
    req.client.setClientIp(req.ip);
    next();
}


function initDevice(req, res, next) {
    // Check if already defined by user agent
    if (req.client.deviceId) {
        return;
    }
    
    // Look at cookies
    var deviceId = req.cookies.device;
    if (deviceId) {
        req.client.setDeviceId(deviceId);
        next();
        return;
    }

    // Create new device and store in cookies
    req.client.devices.current().then(function(device) {
        var expires = new Date(Date.now() + config.auth.deviceTtlMs);
        req.client.setDeviceId(device.id);
        res.cookie('device', device.id, {expires: expires, httpOnly: true});
        
        next();
    }).catch(function (error) {
        next(error);
    });
}


var router = express.Router();

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());
router.use(initClient);
router.use(initDevice);
router.use(initConfig);

module.exports = router;
