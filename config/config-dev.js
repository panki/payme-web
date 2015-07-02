var config = {
    apiUrl: 'http://127.0.0.1:5000/api',
    baseUrl: 'http://127.0.0.1:3000',
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
    sentry: {
        dns: ''
    }
};

// Angular app config

config.ng = {
    apiUrl: config.apiUrl
};
    
module.exports = config;