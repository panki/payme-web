

var config = require('./config');
var Redis = require('ioredis');
var redis = new Redis(config.redis);
var mqx = require('../x/mqx');

var mq = new mqx.RedisMQ('mq', redis);
var queue = mq.queue('mail');

queue.consume(function(msg) {
    console.log('Message arrived: %s', msg.payload());
    msg.ack();
});