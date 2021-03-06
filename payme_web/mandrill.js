var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var crypto = require('crypto');
var config = require('./config');
var emails = require('../payme/emails');

var mandrill = require('../payme/mandrill');

router.head('/mandrill/:hook', function (req, res, next) {
    // Mandrill uses HEAD request to check url state
    res.end();
});

router.post('/mandrill/:hook', function (req, res, next) {
    
    // Check hook
    
    var hook = config.mandrill.hooks[req.params.hook];
    if (!hook) return res.status(500).send({error: 'Unexpected hook: ' + req.params.hook});
    
    // Check signature
    
    var signature = req.headers['x-mandrill-signature'];
    var data = hook.url + 'mandrill_events' + req.body.mandrill_events;
    var expectedSignature = crypto.createHmac('sha1', hook.key).update(data, 'utf8', 'binary').digest('base64');
    
    if (signature != expectedSignature) {
        console.log('Wrong request signature: expected', expectedSignature, 'but received', signature);
        // Temporary disabled
        //return res.status(500).send({error: 'Wrong request signature'});
    }
    
    // Parse events
    
    try {
        req.events = JSON.parse(req.body.mandrill_events || '[]');   
    } catch(e) {
        return res.status(500).send({error: 'Invaid json format: ' + e.message});
    }
    
    next();
});

router.post('/mandrill/events', function (req, res, next) {
    req.events.forEach(function (event) {
        mandrill.handleMessageEvent(event);
    });
    res.end('Ok');
});

router.post('/mandrill/inbound', function (req, res, next) {
    Promise.map(req.events, function (event) {
        if (event.event == 'inbound') {
            var iReq = mandrill.validateInvoiceRequest(event.msg);
            if (iReq) {
                console.log('Push create invoice message', iReq);
                return emails.inbound.emailArrived(iReq.from, iReq.to, iReq.subject, event.ts);
            } else {
                console.log('Relay message', event.msg);
                return mandrill.relayMessage(event.msg);
            }
        } else {
            console.log('Unexpected email event (unknown event type)', event);
        }
    }).then(function() {
        res.end('Ok');
    });
});

module.exports = router;