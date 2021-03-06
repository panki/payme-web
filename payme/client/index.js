'use strict';
var Promise = require('bluebird');
var cookie = require('cookie');
var extend = require('util')._extend;
var querystring = require('querystring');
var request = Promise.promisifyAll(require('request'));

var Auth = require('./auth');
var Devices = require('./devices');
var Emails = require('./emails');
var Alfabank = require('./alfabank');
var Invoices = require('./invoices');


/**
 * Creates a new client.
 * @param config    Config.
 * @param url       API URL.
 * @param token     Optional auth token.
 */
function Client(config, url, token) {
    this.apiUrl = url;
    this.token = token;
    this.config = config;
    this.deviceId = null;

    this.auth = new Auth(this);
    this.devices = new Devices(this);
    this.emails = new Emails(this, config);
    this.alfabank = new Alfabank(this);
    this.invoices = new Invoices(this);
    
    this.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    
    this.setUserAgent(config.client.defaultUserAgent);
    this.setToken(token);
}

Client.prototype.setUserAgent = function(ua) {
    if (!ua) {
        return;
    }

    this.headers['User-Agent'] = ua;
    if (ua in this.config.client.devices) {
        this.setDeviceId(this.config.client.devices[ua]);    
    }
};

Client.prototype.setDeviceId = function(deviceId) {
    if (!deviceId) {
        return;
    }

    this.deviceId = deviceId;
    this.addCookie('device', deviceId);
};

Client.prototype.setSessionId = function(sessionId) {
    if (!sessionId) {
        return;
    }

    this.headers['Authorization'] = 'session ' + sessionId;
};

Client.prototype.setToken = function(token) {
    if (!token) {
        return;
    }

    this.headers['Authorization'] = 'token ' + token;
};

Client.prototype.setClientIp = function(ip) {
    if (!ip) {
        return;
    }

    this.headers['Payme-Web-Client-Ip'] = ip;
};

Client.prototype.addCookie = function(key, val) {
    var c = this.headers['Cookie'];
    if (!c) {
        c = '';
    } else {
        c = c + '; ';
    }
    
    this.headers['Cookie'] = c + cookie.serialize(key, val);
};

Client.prototype.addCookies = function(cookies) {
    if (!cookies){
        return;
    }

    var keys = Object.keys(cookies);
    for (var i = 0; i < cookies.length; i++) {
        var key = keys[i];
        var val = cookies[key];
        this.addCookie(key, val);
    }
};

Client.prototype.get = function(path, params) {
    var self = this;
    var t0 = new Date().getTime();
    var url = self.apiUrl + path;
    var headers = self.headers;
    console.log(headers);
    
    return request.getAsync({
        url: url,
        qs: params,
        headers: headers,
        useQuerystring: true
    })
        .catch(function(error) {
            console.log('API ERROR ' + error + ', url=' + fullUrl(url, params));
            throw error;
        })
        .then(function(result) {
            var response = result[0];
            var t1 = new Date().getTime();
            
            console.log('API GET ' + response.statusCode + ' ' + (t1 - t0) + 'ms ' +
                        fullUrl(url, params));
            return self.parseResponse(response);
        });
};

Client.prototype.post = function(path, params) {
    var self = this;
    var t0 = new Date().getTime();
    var url = self.apiUrl + path;
    var headers = self.headers;
    console.log(headers);
    
    return request.postAsync({
        url: url,
        headers: headers,
        useQuerystring: true,
        form: params
    })
        .catch(function(error) {
            console.log('API ERROR ' + error + ', url=' + url);
            throw error;
        })
        .then(function(result) {
            var response = result[0];
            var t1 = new Date().getTime();
            
            console.log('API POST ' + response.statusCode + ' ' + (t1 - t0) + 'ms ' + url);
            return self.parseResponse(response);
        });
};

Client.prototype.parseResponse = function(response) {
    var status = response.statusCode;
    var body = response.body;
    var error;
    
    switch (status) {
        case 200:
            return JSON.parse(body);
        case 204:
            return null;
        case 422:
            var e = JSON.parse(body);
            
            error = new Error(e.message);
            error.code = e.code;
            throw error;
        default:
            error = new Error(body);
            error.status = status;
            error.error = body;
            throw error;
    }
};

function fullUrl(url, queryParams) {
    if (!queryParams) {
        return url
    }

    var q = querystring.stringify(queryParams);
    if (url.indexOf("?") > -1) {
        return url + '&' + q;
    } else {
        return url + '?' + q;
    }
}

module.exports = Client;
