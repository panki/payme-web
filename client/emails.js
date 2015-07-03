url = require('url');

function Emails(client) {
    
    this.client = client;
    this.config = client.config;
    var self = this;
    
    this.get = function(emailId) {
        return this.client.get('/emails/' + emailId).then(function (email) {
            email.template = email.type;
            email.viewUrl = [self.config.baseUrl, 'emails/view', email.id].join('/');
            email.confirmUrl = [self.config.baseUrl, 'invoice/confirm', email.invoice.id, '?auth_token=' + email.auth_token_id].join('/');
            email.payUrl = [self.config.baseUrl, 'invoice/pay', email.invoice.id, '?auth_token=' + email.auth_token_id].join('/');
            email.invoiceUrl = [self.config.baseUrl, 'invoice', email.invoice.id, '?auth_token=' + email.auth_token_id].join('/');
            email.refuseUrl = [self.config.baseUrl, 'invoice/refuse', email.invoice.id, '?auth_token=' + email.auth_token_idd].join('/');
            email.cancelUrl = [self.config.baseUrl, 'invoice/cancel', email.invoice.id, '?auth_token=' + email.auth_token_id].join('/');
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