url = require('url');

function Emails(client, config) {
    this.client = client;
    this.config = config;
    var self = this;

    this.get = function(emailId) {
        return this.client.get('/emails/' + emailId).then(function (email) {
            var token = '?token=' + email.auth_token_id;
            email.template = email.type;
            email.viewUrl       = [self.config.baseUrl, 'emails', email.id].join('/');
            email.invoiceUrl    = [self.config.baseUrl, 'invoice', email.invoice.id, token].join('/');
            email.confirmUrl    = [self.config.baseUrl, 'invoice', email.invoice.id, 'send', token].join('/');
            email.payUrl        = [self.config.baseUrl, 'invoice', email.invoice.id, 'pay',     token].join('/');
            email.refuseUrl     = [self.config.baseUrl, 'invoice', email.invoice.id, 'refuse',  token].join('/');
            email.cancelUrl     = [self.config.baseUrl, 'invoice', email.invoice.id, 'cancel',  token].join('/');
            email.termsUrl      = [self.config.baseUrl, 'terms'].join('/');
            return email;
        });
    };
    
    this.fail = function(emailId, reason, timestamp) {
        return this.client.post('/emails/' + emailId + '/failed', {reason: reason, timestamp: timestamp});
    };
    
    this.sent = function(emailId, timestamp) {
        return this.client.post('/emails/' + emailId + '/sent', {timestamp: timestamp});
    };
    
    this.opened = function(emailId, timestamp) {
        return this.client.post('/emails/' + emailId + '/opened', {timestamp: timestamp});
    };
    
    this.delivered = function(emailId, timestamp) {
        return this.client.post('/emails/' + emailId + '/delivered', {timestamp: timestamp});
    };
}

module.exports = Emails;
