url = require('url');

function Auth(client) {
    this.client = client;
    this.config = client.config;

    this.authorize_token = function(token) {
        return this.client.post('/auth/authorize_token', {token: token});
    };

    this.authorize_session = function(session_id) {
        return this.client.post('/auth/authorize_session', {session_id: session_id});
    };
}

module.exports = Auth;
