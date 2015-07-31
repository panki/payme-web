var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var crypto = require('crypto');
var Redis = require('ioredis');
var config = require('./config');
var mqx = require('../x/mqx');
var redis = new Redis(config.redis);
var mq = new mqx.RedisMQ('mq', redis);

var transport = require('../mailer/transport');

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
        pushEventToWorker(event)
    });
    res.end('Ok');
});

router.post('/mandrill/inbound', function (req, res, next) {
    Promise.map(req.events, function (event) {
        if (event.event == 'inbound') {
            var invoiceRequest = validateInvoiceRequest(event.msg);
            if (invoiceRequest) return req.client.invoices.create(invoiceRequest);    
            return relayMessage(event.msg);
        } else {
            console.log('Unexpected email event (unknown event type)', event);
        }
    }).then(function() {
        res.end('Ok');
    }).catch(function(err) {
        res.status(500).send({error: err.message});
    });
});

function validateInvoiceRequest(msg) {
    var payme_domain = /^.+@(dev\.)?payme4\.ru$/;
    var amount = parseInt(msg.subject.replace(/^\D+/, ''));
    if ( isNaN(amount) || amount < 100 || amount > 75000) return false;
    
    if (msg.to.length != 1) return false;
    if (msg.cc.length != 1) return false;
    
    var from_email = msg.from_email.toLowerCase();
    var cc_email = msg.cc[0][0].toLowerCase();
    var to_email = msg.to[0][0].toLowerCase();
    
    if (from_email.match(payme_domain)) return false;
    if (to_email.match(payme_domain) && cc_email.match(payme_domain)) return false;
    
    return {
        amount: amount,
        owner_email: from_email,
        payer_email: to_email.match(payme_domain) ? cc_email : to_email
    }
}

function relayMessage(msg) {
    return Promise.map(msg.to, function (to) {
        var to_email = to[0].toLowerCase();
        var forward = config.mandrill.hooks.inbound.relays[to_email];
        if (forward) {
            return transport.send({
                from: msg.from_email,
                to: forward,
                subject: msg.subject,
                text: msg.text,
                html: msg.html
            })
        } else {
            console.log('Unhandled email', msg);
        }
    });
}
    
function pushEventToWorker(event) {
    var emailId = event.msg && event.msg.metadata ? event.msg.metadata.email_id : null;
    if (!emailId) {
        console.log('Unexpected email event (empty email_id)', event);
        return;
    }
    
    var msg = {
        emailId: emailId,
        event: '',
        eventReason: '',
        timestamp: event.ts
    };
    
    switch (event.event) {
        case 'send': msg.event = 'delivered'; break;
        case 'open': msg.event = 'opened'; break;
        case 'hard_bounce':
            msg.event = 'failed';
            msg.eventReason = event.msg.bounce_description + ' : ' + event.msg.diag;
            break;
        case 'soft_bounce':
            msg.event = 'failed';
            msg.eventReason = event.msg.bounce_description + ' : ' + event.msg.diag;
            break;
        case 'reject':
            msg.event = 'failed';
            msg.eventReason = 'rejected';
            break;
        default:
            console.log('Unexpected email event (unknown event type)', event);
            return;
    }
    
    mq.queue('emails-events').put(JSON.stringify(msg));
}

module.exports = router;