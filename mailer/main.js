var config = require('./config')
var Redis = require('ioredis');
var redis = new Redis(config.redis);

console.log(config.redis);

redis.get('foo').then(function (result) {
    console.log('2', result);
    return redis.set('foo', '1');
}).then(function (err, result) {
    console.log(err, result);
    return redis.get('foo')
}).then(function (result) {
    console.log('3', result);
    console.log('END');
    process.exit()
    
});

