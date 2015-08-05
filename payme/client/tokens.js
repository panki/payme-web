url = require('url');

function Tokens(client) {
    
    this.client = client;
    this.config = client.config;
    
    this.authorize = function(token) {
        return this.client.post('/auth/authorize_token', {token: token }).then(function (session) {
            return session;
        });
    };
}

module.exports = Tokens;