var _ = require('lodash');
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

function getMessageRecipients(msg) {
    var recipients = msg.to;
    if (msg.cc) recipients = recipients.concat(msg.cc);
    if (msg.bcc) recipients = recipients.concat(msg.bcc);
    
    return recipients.map(function (t) {
        // Get lowercase email address
        return t[0].toLowerCase(); 
    });
    
}

module.exports.validateInvoiceRequest = function (msg) {
    var recipients = getMessageRecipients(msg);
    var intersection = _.intersection(recipients, config.mail.invoiceCreateAddresses);
    var difference = _.difference(recipients, config.mail.invoiceCreateAddresses).filter(
        // Skip inbound domain emails
        function(email) {
            return email.indexOf(config.mail.inboundDomain) == -1;
        }
    );
    
    if (intersection && difference) {
        return {
            from: msg.from_email.toLowerCase(),
            to: difference,
            subject: msg.subject
        }
    }
    
    return null;
};

module.exports.relayMessage = function(msg) {
    var recipients = getMessageRecipients(msg)
    .filter(function(t) {
        // Filter only inbound domain recipients
        return t.indexOf(config.mail.inboundDomain) > 0;
    })
    .map(function(t) {
        // Get recipient forward message or change inbound domain to mail domain
        return config.mandrill.hooks.inbound.relays[t] || t.replace(config.mail.inboundDomain, config.mail.mailDomain);
    });
    
    return Promise.map(recipients, function (recipient) {
        return emails.transport.send({
            from: msg.from_email,
            to: recipient,
            subject: msg.subject,
            text: msg.text,
            html: msg.html
        })
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

