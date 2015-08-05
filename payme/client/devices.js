'use strict';


function Devices(client, config) {
    this.client = client;
    this.config = config;
    
    this.current = function() {
        return this.client.get('/devices/current')
    };
}

module.exports = Devices;
