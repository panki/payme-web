var config = {
    apiUrl: 'http://dev.payme4.ru/api',    // No trailing slash.
    baseUrl: 'http://dev.payme4.ru',       // No trailing slash.
    redis: {
        host: '127.0.0.1',
        port: 6379,
        db: 0
    },
    mailer: {
        from: 'Dev payme robot <robot@dev.payme4.ru>',
        transport: {
            smtp: {
                host: 'localhost',
                port: 25,
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

// Mandrill config

config.mandrill = {
    webHookKey: 'gER36Q6g9EF5gruFuMgFXA',
    webHookUrl: config.baseUrl + '/mandrill/webhook'
};
    
module.exports = config;
