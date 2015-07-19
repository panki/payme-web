var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var crypto = require('crypto');
var config = require('./config');

router.post('/mandrill/webhook', function (req, res, next) {
    
    // Check request signature
    
    var signature = req.headers['x-mandrill-signature'];
    var data = config.mandrill.webHookUrl + 'mandrill_events' + req.body.mandrill_events;
    var expectedSignature = crypto.createHmac('sha1', config.mandrill.webHookKey).update(data, 'utf8', 'binary').digest('base64');
    
    if (signature != expectedSignature) {
        console.log('Wrong request signature: expected', expectedSignature, 'but received', signature);
        return res.status(500).send({error: 'Wrong request signature'});
    } 
    
    // Parse events
    
    var events = [];
    try {
        events = JSON.parse(req.body.mandrill_events || '[]');   
    } catch(e) {
        return res.status(500).send({error: 'Invaid json format: ' + e.message});
    }
    
    // Handle events
    
    Promise.map(events, function (event) {
        var emailId = event.msg.metadata.email_id;
        if (emailId) {
            switch (event.event) {
                case 'sent':
                    return req.client.emails.delivered(emailId, event.ts);
                case 'open':
                    return req.client.emails.opened(emailId, event.ts);
                case 'hard_bounce':
                    var hard_bounce_error = event.msg.bounce_description + ' : ' + event.diag;
                    return req.client.emails.fail(emailId, hard_bounce_error, event.ts);
                case 'soft_bounce':
                    var soft_bounce_error = event.msg.bounce_description + ' : ' + event.diag;
                    return req.client.emails.fail(emailId, soft_bounce_error, event.ts);
                default:
                    console.log('Unexpected email event (unknown event type)', event);
            }
        } else {
            console.log('Unexpected email event (empty email_id)', event);
        }
    }).then(function() {
        res.end('Ok');
    }).catch(function(err) {
        res.status(500).send({error: err.message});
    });
});

module.exports = router;
