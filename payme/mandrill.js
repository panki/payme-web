var Promise = require('bluebird');
var config = require('./config');
var emails = require('./emails');

module.exports.makeHeaders = function(email) {
    return {
        // Is used in analytics in mandrill 
        'X-MC-Tags': email.type,
        // Track emails opens
        'X-MC-Track': 'opens',
        // Is used to identify emails in events, like delivery, open, etc.
        'X-MC-Metadata': '{ "email_id": "' + email.id + '" }'
    }
};


module.exports.validateInvoiceRequest = function (msg) {
    var payme_domain = /^.+@(dev\.)?payme4\.ru$/;
    var amount = parseInt(msg.subject.replace(/^\D+/, ''));
    if ( isNaN(amount) || amount < config.invoices.minAmount || amount > config.invoices.maxAmount) return false;
    
    if (msg.to.length != 1) return false;
    if (!msg.cc || msg.cc.length != 1) return false;
    
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
};

module.exports.relayMessage = function(msg) {
    return Promise.map(msg.to, function (to) {
        var to_email = to[0].toLowerCase();
        var forward = config.mandrill.hooks.inbound.relays[to_email];
        if (forward) {
            return emails.transport.send({
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
};
    
module.exports.handleMessageEvent = function(event) {
    var emailId = event.msg && event.msg.metadata ? event.msg.metadata.email_id : null;
    if (!emailId) {
        console.log('Unexpected email event (empty email_id)', event);
        return;
    }
    
    switch (event.event) {
        case 'send': events.emailSent(emailId, event.ts); break;
        case 'open': events.emailOpened(emailId, event.ts); break;
        case 'hard_bounce': events.emailFailed(emailId, event.ts, event.msg.bounce_description + ' : ' + event.msg.diag); break;
        case 'soft_bounce':events.emailFailed(emailId, event.ts, event.msg.bounce_description + ' : ' + event.msg.diag); break;
        case 'reject': events.emailFailed(emailId, event.ts, 'rejected'); break;
        default:
            console.log('Unexpected email event (unknown event type)', event);
            return;
    }
};

