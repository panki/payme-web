function Emails(client) {
    
    this.client = client;
    
    this.get = function(emailId) {
        return this.client.get('/emails/' + emailId);
    };
    
    this.fail = function(emailId, reason) {
        return this.client.post('/emails/' + emailId + '/fail', {reason: reason});
    };
    
    this.sent = function(emailId) {
        return this.client.post('/emails/' + emailId + '/sent');
    };
}

module.exports = Emails;