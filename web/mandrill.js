var express = require('express');
var router = express.Router();
var Promise = require('bluebird');

router.post('/mandrill/webhook', function (req, res, next) {
    var events = req.body;
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
