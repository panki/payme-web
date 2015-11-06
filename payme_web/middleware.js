var _ = require('lodash');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
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
        next();
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


function saveUtmParams(req, res, next) {
    var utm0 = req.signedCookies.utm;
    var utm1 = utmCookie(req.query);
    
    if (utm1 && !_.isEqual(utm0, utm1)) {
        var expires = new Date(Date.now() + config.cookies.utmTtlMs);
        var cookie = utmCookie(req.query);
        res.cookie('utm', cookie, {expires: expires, signed: true});
    }
    next();
}


function saveReferrer(req, res, next) {
    var h = req.get('Host');
    var r0 = req.signedCookies['utm-referrer'];
    var r1 = req.get('Referer');
    
    if (r1 && r1.indexOf(h) == -1 && r1 != r0) {
        var expires = new Date(Date.now() + config.cookies.utmTtlMs);
        res.cookie('utm-referrer', r, {expires: expires, signed:true});
    }
    next();
}


function utmCookie(query) {
    var r = {};
    if (query.utm_source) {
        r.utm_source = query.utm_source;
    }
    if (query.utm_medium) {
        r.utm_medium = query.utm_medium;
    }
    if (query.utm_campaign) {
        r.utm_campaign = query.utm_campaign;
    }
    if (query.utm_term) {
        r.utm_term = query.utm_term;
    }
    if (query.utm_content) {
        r.utm_content = query.utm_content;
    }
    return query;
}


var router = express.Router();
router.use(bodyParser.json({limit: '100mb'}));
router.use(bodyParser.urlencoded({ extended: false, limit: '100mb' }));
router.use(cookieParser(config.cookies.secret));
router.use(initClient);
router.use(initDevice);
router.use(initConfig);
router.use(saveUtmParams);
router.use(saveReferrer);
module.exports = router;
