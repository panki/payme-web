var config = {
    apiUrl: 'http://dev.paymepayme.com/api',    // No trailing slash.
    baseUrl: 'http://dev.paymepayme.com',       // No trailing slash.
    redis: {
        host: '127.0.0.1',
        port: 6379,
        db: 0
    },
    mailer: {
        from: 'Payme robot <robot@paymepayme.com>',
        transport: {
            smtp: {
                host: 'localhost',
                port: 22225,
                secure: false,
                ignoreTLS: true
            }
        }
    },
    invoices: {
        minAmount: 100,
        maxAmount: 75000
    },
    sentry: {
        dns: ''
    }
};

// Angular app config

config.ng = {
    apiUrl: config.apiUrl,
    termUrl: config.baseUrl + '/transaction/confirmed/'
};
    
module.exports = config;
