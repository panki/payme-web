'use strict';
var Promise = require('bluebird');
var extend = require('util')._extend;
var querystring = require('querystring');
var request = Promise.promisifyAll(require('request'));

var Devices = require('./devices');
var Emails = require('./emails');
var Tokens = require('./tokens');
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
    
    this.devices = new Devices(this);
    this.emails = new Emails(this, config);
    this.tokens = new Tokens(this);
    this.alfabank = new Alfabank(this);
    this.invoices = new Invoices(this);

    this.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    if (token) {
        this.headers['Authorization'] = 'token ' + this.token;
    }
    
    this.setUserAgent(config.client.device.userAgent);
    this.setDeviceId(config.client.device.id);
}

Client.prototype.setUserAgent = function(ua) {
    if (!ua) {
        return;
    }

    this.headers['User-Agent'] = ua;
};

Client.prototype.setDeviceId = function(deviceId) {
    if (!deviceId) {
        return;
    }

    this.headers['Cookie'] = 'device=' + deviceId;
};

Client.prototype.get = function(path, params) {
    var self = this;
    var t0 = new Date().getTime();
    var url = self.apiUrl + path;
    var headers = self.headers;

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
            error = new Error(JSON.parse(body).message);
            error.status = status;
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
