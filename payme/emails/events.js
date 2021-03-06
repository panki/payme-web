var Redis = require('ioredis');
var config = require('../config');
var mqx = require('../x/mqx');
var redis = new Redis(config.redis);
var mq = new mqx.RedisMQ('mq', redis);
var Client = require('../client');


var EVENTS_QUEUE = 'emails-events';

var EVENTS = {
    DELIVERED: 'delivered',
    OPENED: 'opened',
    FAILED: 'failed',
    SENT: 'sent'
};

var messageEvent = function(emailId, event, eventReason, timestamp) {
        this.emailId = emailId;
        this.event = event;
        this.eventReason = eventReason;
        this.timestamp = timestamp;
};

function pushMessageEvent(messageEvent) {
    return mq.queue(EVENTS_QUEUE).put(JSON.stringify(messageEvent));
}

function handleMessageEvent(client, messageEvent) {
    /*
     Process email events such as delivery, open etc.
     For each event type calls appropriate client method.   
    */
    var method;
    var event = messageEvent;
    
    switch (event.event) {
        case EVENTS.DELIVERED: method = client.emails.delivered(event.emailId, event.timestamp); break;
        case EVENTS.OPENED: method = client.emails.opened(event.emailId, event.timestamp); break;
        case EVENTS.FAILED: method = client.emails.fail(event.emailId, event.eventReason, event.timestamp); break;
        case EVENTS.SENT: method = client.emails.sent(event.emailId, event.timestamp); break;
        default:
            throw new Error('Unexpected email event (unknown event type)')
    }
    return method;
}

module.exports.emailDelivered = function(emailId, ts) {
    var msg = new messageEvent(emailId, EVENTS.DELIVERED, null, ts);
    return pushMessageEvent(msg);
};

module.exports.emailOpened = function(emailId, ts) {
    var msg = new messageEvent(emailId, EVENTS.OPENED, null, ts);
    return pushMessageEvent(msg);
};

module.exports.emailFailed = function(emailId, ts, reason) {
    var msg = new messageEvent(emailId, EVENTS.FAILED, reason, ts);
    return pushMessageEvent(msg);
};

module.exports.emailSent = function(emailId, ts) {
    var msg = new messageEvent(emailId, EVENTS.SENT, null, ts);
    return pushMessageEvent(msg);
};

module.exports.startEventHandler = function() {
    /* 
    Start consuming messages from EVENTS_QUEUE
    and handles its
    */
    var client = new Client(config, config.apiUrl);
    
    mq.queue(EVENTS_QUEUE).consume(function(msg) {
        
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