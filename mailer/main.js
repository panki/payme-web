var ejs = require('ejs');
var he = require('he');
var crypto = require('crypto');
var Redis = require('ioredis');


var config = require('./config');
var transport = require('./transport');
var render = require('./templates')('mailer/templates');
var mqx = require('../x/mqx');
var Client = require('../client');
var mandrill = require('./mandrill');
var client = new Client(config, config.apiUrl);


var redis = new Redis(config.redis);
var mq = new mqx.RedisMQ('mq', redis);


/**
 * Consume messages from mq
 */

mq.queue('emails').consume(function(msg) {
    var emailId = msg.payload();
    console.log('Message arrived: %s', emailId);
    client.emails.get(emailId).then(function(email) {
        send_email(email).then(function(mail_info) {
            var timestamp = Math.round(Date.now()/1000);
            console.log('Message %s sent %s', email.id, mail_info.response);
            client.emails.sent(email.id, timestamp).then(function() { msg.ack(); });
        }).catch(function(e) {
            console.log('Failed to send message %s error=%s', email.id, e);
            msg.retry();
        });        
    });
});

/**
 * Send email.
 *
 * @param {Object} email
 * @return {Object} promise
 */

function send_email(email) {
    var emailId = email.id;
    var emailType = email.type;
    var emailAddress = email.address;
    
    return render(email.template, { email: email, config: config }).then(function(content) {
        return {
            from: config.mailer.from,
            to: emailAddress,
            subject: content.subject,
            text: content.body.text,
            html: content.body.html,
            headers: mandrill.makeHeaders(email)
        };
    })
    .then(function(mail_options) {
        return embed_images(mail_options);
    })
    .then(function(mail_options) {
        var mo = mail_options;
        console.log(
            'Sending, email: id=%s, type=%s, address=%s; ' 
            + 'data: from=%s, to=%s, subject=%s, text=%s, html=%s',
            emailId, emailType, emailAddress, mo.from, mo.to, mo.subject, mo.text, mo.html);
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
