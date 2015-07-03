url = require('url');

function Alfabank(client) {
    
    this.client = client;
    this.config = client.config;
    
    this.confirm_transaction = function(PaRes, MD) {
        return this.client.post('/transaction/confirmed/', {PaRes: PaRes, MD: MD});
    };
}

module.exports = Alfabank;