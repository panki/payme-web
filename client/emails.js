url = require('url');

function Emails(client) {
    
    this.client = client;
    this.config = client.config;
    var self = this;

    this.get = function(emailId) {
        return this.client.get('/emails/' + emailId).then(function (email) {
            var token = '?token=' + email.auth_token_id;
            email.template = email.type;
            email.viewUrl       = [self.config.baseUrl, 'emails/view', email.id].join('/');
            email.invoiceUrl    = [self.config.baseUrl, 'invoice', email.invoice.id, token].join('/');
            email.confirmUrl    = [self.config.baseUrl, 'invoice', email.invoice.id, 'send', token].join('/');
            email.payUrl        = [self.config.baseUrl, 'invoice', email.invoice.id, 'pay',     token].join('/');
            email.refuseUrl     = [self.config.baseUrl, 'invoice', email.invoice.id, 'refuse',  token].join('/');
            email.cancelUrl     = [self.config.baseUrl, 'invoice', email.invoice.id, 'cancel',  token].join('/');
            email.termsUrl      = [self.config.baseUrl, 'terms'].join('/');
            return email;
        });
    };
    
    this.fail = function(emailId, reason) {
        return this.client.post('/emails/' + emailId + '/fail', {reason: reason});
    };
    
    this.sent = function(emailId) {
        return this.client.post('/emails/' + emailId + '/sent');
    };
}

module.exports = Emails;