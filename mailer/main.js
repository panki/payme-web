var debug = require('debug')('payme:mailer');
var ejs = require('ejs');
var he = require('he');
var crypto = require('crypto');
var Redis = require('ioredis');


var config = require('./config');
var transport = require('./transport');
var render = require('./templates')('mailer/templates');
var mqx = require('../x/mqx');
var Client = require('../client');
var client = new Client(config, config.apiUrl);


var redis = new Redis(config.redis);
var mq = new mqx.RedisMQ('mq', redis);


/**
 * Consume messages from mq
 */

mq.queue('emails').consume(function(msg) {
    var emailId = msg.payload();
    debug('Message arrived: %s', emailId);
    client.emails.get(emailId).then(function(email) {
        send_email(email).then(function(mail_info) {
            debug('Message %s sent %s', email.id, mail_info.response);
            client.emails.sent(email.id).then(function() { msg.ack(); });
        }).catch(function(e) {
            debug('Failed to send message %s error=%s', email.id, e);
            if (msg.retry_count() < 3) {
                msg.retry();
            } else {
                client.emails.fail(email.id, e.message);
                msg.ack();
            }
        });        
    });
});

//setTimeout(function() { mq.queue('emails').put('da8bc188-de80-4053-b280-6ec3e348fa31');}, 1000);

/**
 * Send email.
 *
 * @param {Object} email
 * @return {Object} promise
 */

function send_email(email) {
    return render(email.template, { email: email, config: config }).then(function(content) {
        return {
            from: config.mailer.from,
            to: email.address,
            subject: content.subject,
            text: content.body.text,
            html: content.body.html
        };
    })
    .then(function(mail_options) {
        return embed_images(mail_options);
    })
    .then(function(mail_options) {
        return transport.send(mail_options);
    })
}


/**
 * Embeds html images into attachments.
 *
 * @param {Object} mail_options - dict with html key
 * @return {Object} modified mail_options param with changed html & attachments
 */

function embed_images(mail_options) {
    mail_options.attachments = [];
    var _cache = {};
    mail_options.html = mail_options.html.replace(/<img[^>]*>/gi, function(imgTag) {
            return imgTag.replace(/\b(src\s*=\s*(?:['"]?))([^'"> ]+)/i, function(src, prefix, url) {
                var cid;
                url = he.decode(url || "").trim();
                prefix = prefix || "";
                if (!_cache[url]) {
                    cid = crypto.randomBytes(20).toString("hex");
                    mail_options.attachments.push({
                        path: url,
                        cid: cid
                    });
                    _cache[url] = cid;    
                }
                url = "cid:" + _cache[url];
                return prefix + url;
            });
        });
    return mail_options;
}