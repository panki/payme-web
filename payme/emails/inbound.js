var Promise = require('bluebird');
var Redis = require('ioredis');
var config = require('../config');
var mqx = require('../x/mqx');
var redis = new Redis(config.redis);
var mq = new mqx.RedisMQ('mq', redis);
var Client = require('../client');


var INBOUND_QUEUE = 'emails-inbound';

var messageEvent = function(from, to, subject, ts) {
    this.from = from;
    this.to = to;
    this.subject = subject;
    this.timestamp = ts;
};

function pushMessageEvent(messageEvent) {
    return mq.queue(INBOUND_QUEUE).put(JSON.stringify(messageEvent));
}

module.exports.emailArrived = function(from, to, subject, ts) {
    var msg = new messageEvent(from, to, subject, ts);
    return pushMessageEvent(msg);
};

function handleMessageEvent(client, messageEvent) {
    /*
     Process inbound email events.   
    */
    
    var falsePromise = new Promise(function(resolve, reject) {
       resolve(false); 
    });

    var amount = parseInt(messageEvent.subject.replace(/^\D+/, ''));
    if ( isNaN(amount) || amount < config.invoices.minAmount || amount > config.invoices.maxAmount) {
        // TODO: Send email with error to sender
        console.log('Invoice create failed: invalid invoice amount in subject', messageEvent);
        return falsePromise;
    }
    
    if ( messageEvent.subject.toLowerCase().indexOf('RE:') == 0) {
        console.log('Invoice create skipped', messageEvent);
        return falsePromise;
    }
    
    var current = Promise.resolve();
    
    return Promise.map(messageEvent.to, function(recipient) {
        current = current.then(function () {
            return client.invoices.createFromEmail({
                owner_email: messageEvent.from,
                payer_email: recipient,
                amount: amount
            });
        });
        return current;
    });
}

module.exports.startEventHandler = function() {
    /* 
    Start consuming messages from INBOUND_QUEUE
    and handles its
    */
    var client = new Client(config, config.apiUrl);
    
    mq.queue(INBOUND_QUEUE).consume(function(msg) {
        
        // Expects stringified messageEvent objects
        var msgEvent = JSON.parse(msg.payload());
        
        handleMessageEvent(client, msgEvent).then(function() {
            msg.ack();
        }).catch(function(e) {
            console.log('Failed to handle message %s error=%s', msg.payload(), e);
            if (msg.retry_count() < 10) {
                msg.retry();
            }
        });
    
    });
};