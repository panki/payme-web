url = require('url');

function Emails(client) {
    
    this.client = client;
    this.config = client.config;
    var self = this;
    
    this.get = function(emailId) {
        return this.client.get('/emails/' + emailId).then(function (email) {
            email.template = email.type;
            email.viewUrl = [self.config.baseUrl, 'emails/view', email.id].join('/');
            email.actionUrl = [self.config.baseUrl, email.type, email.invoice_id].join('/');
            email.refuseUrl = [self.config.baseUrl, 'invoice/refuse', email.auth_token_id].join('/');
            email.cancelUrl = [self.config.baseUrl, 'invoice/cancel', email.auth_token_id].join('/');
            email.termsUrl = [self.config.baseUrl, 'terms'].join('/');
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