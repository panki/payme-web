'use strict';
var Promise = require('bluebird');
var querystring = require("querystring");
var request = Promise.promisifyAll(require('request'));

var Emails = require('./emails');
var Tokens = require('./tokens');
var Alfabank = require('./alfabank');


function Client(config, url, token) {
    this.apiUrl = url;
    this.token = token;
    this.config = config;
    this.emails = new Emails(this);
    this.tokens = new Tokens(this);
    this.alfabank = new Alfabank(this);
}

Client.prototype.get = function(path, params) {
    var self = this;
    var t0 = new Date().getTime();
    var url = self.apiUrl + path;
    var headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    if (self.token) {
        headers['Authorization'] = 'token ' + self.token;
    }

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
    var headers = {'Content-Type': 'application/x-www-form-urlencoded'};
    if (self.token) {
        headers['Authorization'] = 'token ' + self.token;
    }

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