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
    req.client.addCookies(req.cookies);
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
    
    if (utm1 && !_.isEqual(utm1, {}) && !_.isEqual(utm0, utm1)) {
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
        res.cookie('utm-referrer', r1, {expires: expires, signed:true});
    }
    next();
}


function utmCookie(query) {
    var r = {};
    if (query.utm_source) {
        r.utm_source = query.utm_source.toLowerCase();
    }
    if (query.utm_medium) {
        r.utm_medium = query.utm_medium.toLowerCase();
    }
    if (query.utm_campaign) {
        r.utm_campaign = query.utm_campaign.toLowerCase();
    }
    if (query.utm_term) {
        r.utm_term = query.utm_term;
    }
    if (query.utm_content) {
        r.utm_content = query.utm_content;
    }
    if (query.tid) {
        r.utm_tid = query.tid;
    }
    return r;
}

function robots(req, res, next) {
    if (req.url != '/robots.txt') return next();
    res.type('text/plain');
    if (app.settings.env == 'production') {
        res.send("User-agent: *\nAllow: /");
    } else {
        res.send("User-agent: *\nDisallow: /");    
    }
}

var app = express();
var router = express.Router();

router.use(robots);
router.use(bodyParser.json({limit: '100mb'}));
router.use(bodyParser.urlencoded({ extended: false, limit: '100mb' }));
router.use(cookieParser(config.cookies.secret));
router.use(saveUtmParams);
router.use(saveReferrer);
router.use(initClient);
router.use(initDevice);
router.use(initConfig);
module.exports = router;
