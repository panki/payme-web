var crypto = require('crypto')
var utils = require('util')

module.exports = {
    now_millis: now_millis,
    key_queue_consumer: key_queue_consumer
};

// RedisMQ class

const CONSUMER_TTL = 10;

function RedisMQ(name, redis, consumer_ttl) {
    this.name = name;
    this.redis = redis;
    this.consumer_ttl = consumer_ttl || CONSUMER_TTL;
    this.consumer_id = generate_consumer_id();
    this.queues = {};
    var self = this;
    
    this.queue = function(name) {
        var q = self.queues[name];
        if (!q) {
            q = new RedisQueue(this, name);
            self.queues[name] = q;    
        }
        return q;
    };
    
    this.on_before_consume = function() {
        var consumer = key_consumer(this.name, this.consumer_id);
        self.heartbeat(consumer);
        setInterval(function () { self.heartbeat(consumer) }, 1000);
        console.log('Started a consumer heartbeat, consumer', consumer);
    };
    
    this.heartbeat = function(consumer) {
        var value = now_millis();
        this.redis.setex(consumer, this.consumer_ttl, value);
    };

}

module.exports.RedisMQ = RedisMQ;

// RedisQueue class

function RedisQueue(mq, name) {
    this.name = name;
    this.mq = mq;
    this.redis = mq.redis;
    this.consumer_id = mq.consumer_id;
    this.consuming = false;
    
    var self = this;
    
    this.put = function(value) {
        var msg = RedisMessage.create(this, value);
        var queue = key_queue(this.mq.name, this.name);
        this.redis.lpush(queue, msg.string).then(function(result) {
            console.log('Push: queue=%s, msg=%s, result=%s', queue, msg.string, result)
        });
    };
    
    this.schedule = function(value, millis) {
        var msg = RedisMessage.create(this, value);
        var queue_scheduled = key_queue_scheduled(this.mq.name, this.name);
        this.redis.zadd(queue_scheduled, now_millis() + millis, msg.string);
    };
    
    this.clear = function() {
        var queue = key_queue(this.mq.name, this.name);
        var queue_scheduled = key_queue_scheduled(this.mq.name, this.name);
        var queue_consumers = key_queue_consumers(this.mq.name, this.name);

        this.redis.del(queue, queue_scheduled, queue_consumers)
        .then(function (result) {
            if (result != 3) {
                console.log('Clear warning: queue=%s, deleted=%s of 3', self.name, result);
            }
        });
    };
    
    this.consume = function(cb, timeout) {
        this.on_before_consume();

        var queue = key_queue(this.mq.name, this.name);
        var queue_consumer = key_queue_consumer(this.mq.name, this.name, this.consumer_id);
        var redis = this.redis.duplicate();

        function consume_message() {
            redis.brpoplpush(queue, queue_consumer, timeout || 0)
            .then(function (result) {
                console.log('Get message: queue=%s, msg=%s', queue, result);
                if (result) {
                    var msg = RedisMessage.parse(self, result);
                    cb(msg);
                }
                consume_message();
            });
        }
        consume_message();
    };
    
    this.ack = function(string) {
        var queue_consumer = key_queue_consumer(this.mq.name, this.name, this.consumer_id);
        this.redis.lrem(queue_consumer, 1, string)
        .then(function(result) {
            if (result != 1) console.log('Ack failed: consumer=%s, msg=%s, result=%s', queue_consumer, string, err, result);    
        });
    };
    
    this.retry = function(old_string, new_string, delay_millis) {
        var retry_at = now_millis() + delay_millis;
        var queue_consumer = key_queue_consumer(this.mq.name, this.name, this.consumer_id);
        var queue_scheduled = key_queue_scheduled(this.mq.name, this.name);

        self.redis.pipeline()
        .lrem(queue_consumer, 1, old_string)
        .zadd(queue_scheduled, retry_at, new_string)
        .exec().then(function (results) {
            var result = results[results.length-1];
            if (!result) {
                console.log('Retry failed: queue=%s, old=%s, mew=%s, result=%s', self.name, old_string, new_string, result);
            } else {
                console.log('Retry message: queue=%s, old=%s, mew=%s', self.name, old_string, new_string);
            }
        });
    };
    
    this.on_before_consume = function() {
        this.mq.on_before_consume();
        if (this.consuming) return;

        this.consuming = true;
        this.add_queue_consumer();
        this.start_schedule_loop();
        this.start_cleanup_loop();
    };
    
    this.add_queue_consumer = function() {
        var consumer_id = this.consumer_id;
        var queue_consumers = key_queue_consumers(this.mq.name, this.name);
        
        function add_consumer() {
            self.redis.sadd(queue_consumers, consumer_id)
                .then(function(result) {
                    if (result != 1) {
                        console.log('Failed to add consumer: consumer_id=%s, result=%s', consumer_id, result);
                        setTimeout(add_consumer, 5000);
                    } else {
                        console.log('Added a queue consumer, queue=%s, consumer=%s', queue_consumers, consumer_id);
                    }
                });
        }
        add_consumer();
    };
    
    this.start_schedule_loop = function() {
        var script = 'local elems = redis.call("ZRANGEBYSCORE", KEYS[1], ARGV[1], ARGV[2])\n \
            for _,elem in ipairs(elems) do\n \
                redis.call("LPUSH", KEYS[2], elem)\n \
            end\n \
            redis.call("ZREMRANGEBYSCORE", KEYS[1], ARGV[1], ARGV[2])\n \
            return elems\n';
        
        this.redis.defineCommand('schedule', {
            numberOfKeys: 2,
            lua: script
        });

        var queue = key_queue(this.mq.name, this.name);
        var queue_scheduled = key_queue_scheduled(this.mq.name, this.name);

        console.log("Started a scheduler loop, queue=%s", queue)

        function schedule() {
            var millis = now_millis();
            self.redis.schedule(queue_scheduled, queue, 0, millis).then(function (result){
                if (result && result.length) console.log('Scheduled messages: %s', result);
                setTimeout(schedule, 1000);
            });
        }
        
        schedule();
    };
    
    this.start_cleanup_loop = function() {
        var script = ' \
            --- Get all elements from the queueConsumer.\n \
            local elems = redis.call("LRANGE", KEYS[2], 0, -1)\n \
            --- Requeue the elements to the queue.\n \
            for _,elem in ipairs(elems) do\n \
                redis.call("LPUSH", KEYS[1], elem)\n \
            end\n \
            --- Delete the qeueuConsumer.\n \
            redis.call("DEL", KEYS[2])\n \
            --- Delete the consumerId from the queueConsumers.\n \
            redis.call("SREM", KEYS[3], ARGV[1])\n \
            return elems\n';

        this.redis.defineCommand('cleanup', {
            numberOfKeys: 3,
            lua: script
        });
        
        var queue = key_queue(this.mq.name, this.name);
        var queue_consumers = key_queue_consumers(this.mq.name, this.name);
        var maybe_cleanup_consumers = [];
        
        function get_consumers_list() {
            self.redis.smembers(queue_consumers).then(function (result) {
                maybe_cleanup_consumers = maybe_cleanup_consumers.concat(result);
                console.log('Cleanup consumers list: %s', maybe_cleanup_consumers);
                cleanup();
            })
        }
        
        function cleanup() {
            if (maybe_cleanup_consumers.length) {
                var consumer_id = maybe_cleanup_consumers.shift();
                self.maybe_cleanup_consumer(consumer_id, cleanup);
            }
            else {
                setTimeout(get_consumers_list, 5000);
            }
        }
        
        get_consumers_list();
    };
    
    this.maybe_cleanup_consumer = function(consumer_id, next) {
        var consumer = key_consumer(this.mq.name, consumer_id);
        var queue = key_queue(this.mq.name, this.name);
        var queue_consumer = key_queue_consumer(this.mq.name, this.name, consumer_id);
        var queue_consumers = key_queue_consumers(this.mq.name, this.name);
        
        this.redis.exists(consumer)
        .then(function(result) {
            if (result) return next();
            self.redis.cleanup(queue, queue_consumer, queue_consumers, consumer_id)
            .then(function(result) {
                if (result.length) console.log('Cleaned up a consumer, queue=%s, consumer=%s, requeued_messages=%s',
                    queue, consumer_id, result);
                next();
            });
        });
    }
}

// RedisMessage class

function RedisMessage(queue, msg, string) {
    this.queue = queue;
    this.msg = msg;
    this.string = string;
    this.done = false;
    
    this.payload = function() {
        return this.msg['payload'];
    };
    
    this.timestamp = function() {
        return this.msg['timestamp'];
    };
    
    this.retry_count = function() {
        return this.msg['retry_count'];
    };
    
    this.ack = function() {
        if (this.done) return;
        this.done = true;
        this.queue.ack(this.string);
    };
    
    this.retry = function(millis) {
        if (this.done) return;
        this.done = true;
        this.msg['retry_count'] += 1;
        if (!millis) millis = retry_timeout_millis(this.retry_count());
        var new_string = JSON.stringify(this.msg);
        this.queue.retry(this.string, new_string, millis);
    };
    
}

RedisMessage.create = function(queue, payload) {
    var msg = {
        'payload': payload,
        'timestamp': now_millis(),
        'retry_count': 0
    };
    var string = JSON.stringify(msg);
    return new RedisMessage(queue, msg, string);
};

RedisMessage.parse = function(queue, string) {
    var msg = JSON.parse(string);
    return new RedisMessage(queue, msg, string);
};

module.exports.RedisMessage = RedisMessage;

// Functions

function retry_timeout_millis(retry_count) {
    var max_retry_timeout = 10 * 60 * 1000;
    var retry_timeouts = {
        0: 0,
        1: 5 * 1000,            // 5 seconds. 
        2: 10 * 1000,           // 10 seconds.
        3: 30 * 1000,           // 30 seconds.
        4: 60 * 1000,           // 1 minute.
        5: 5 * 60 * 1000,       // 5 minutes.
        6: max_retry_timeout    // 10 minutes.
    };
    return retry_timeouts[retry_count] || max_retry_timeout;
}

function now_millis() {
    return new Date().getTime();
}

function key_consumer(db, consumer_id) {
    return utils.format('%s:_consumers:%s', db, consumer_id)
}

function key_queue(db, queue) {
    return utils.format('%s:%s', db, queue)
}

function key_queue_scheduled(db, queue) {
    return utils.format('%s:%s:scheduled', db, queue)
}

function key_queue_consumers(db, queue) {
    return utils.format("%s:%s:consumers", db, queue)
}

function key_queue_consumer(db, queue, consumer_id) {
    return utils.format('%s:%s:consumers:%s', db, queue, consumer_id)
}

function generate_consumer_id() {
    return process.argv[0] + '-' + crypto.randomBytes(8).toString('hex');
}