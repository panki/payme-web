var Redis = require('ioredis');
var config = require('./config');
var mqx = require('../x/mqx');
var redis = new Redis(config.redis);
var mq = new mqx.RedisMQ('mq', redis);
var Client = require('../client');
var client = new Client(config, config.apiUrl);

client.setDeviceId(config.mailer.device.id);
client.setUserAgent(config.mailer.device.userAgent);

mq.queue('emails-events').consume(function(msg) {
    /*
    
    Process email events such as delivery, open etc.
    For each event type calls appropriate client method.
    
    Expects stringified json object:
    {
        emailId: '',        // email id
        event: '',          // delivered|opened|failed
        eventReason: '',    // event reason (useful only for failed event)
        timestamp: 0        // unix timestamp of event
    }
    
     */
    var event = JSON.parse(msg.payload());
    var method;
    
    switch (event.event) {
        case 'delivered': method = client.emails.delivered(event.emailId, event.timestamp); break;
        case 'opened': method = client.emails.opened(event.emailId, event.timestamp); break;
        case 'failed': method = client.emails.fail(event.emailId, event.eventReason, event.timestamp); break;
        default:
            console.log('Unexpected email event (unknown event type)', event);
            msg.retry();
            return;
    }
    
    method.then(function() {
        msg.ack();
    }).catch(function(e) {
        console.log('Failed to handle message %s error=%s', msg.payload(), e);
        msg.retry();    
    });
});