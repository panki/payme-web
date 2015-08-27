var config = {
    apiUrl: 'https://payme4.ru/api',    // No trailing slash.
    baseUrl: 'https://payme4.ru',       // No trailing slash.
    redis: {
        host: '10.0.10.0',
        port: 6379,
        db: 0
    },
    auth: {
        deviceTtlMs: 10 * 365 * 24 * 3600 * 1000    // 10 years.
    },
    client: {
        device: {
            id: '63ef2d03-5251-409b-b037-0c22532c60c5',
            userAgent: 'Payme web client'
        }
    },
    mail: {
        from: 'Payme4 <robot@payme4.ru>',
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
    },
    contacts: {
        support: {
            email: 'support@payme4.ru',
            phone: '8-800-000-00-00'
        }
    }
};

// Angular app config

config.ng = {
    apiUrl: config.apiUrl,
    termUrl: config.baseUrl + '/transaction/confirmed/',
    sessionPingInterval: 60000,
    invoices: config.invoices,
    contacts: config.contacts
};

// Mandrill config

config.mandrill = {
    hooks: {
        events: {
            url: config.baseUrl + '/mandrill/events',
            key: '7JvQgzpTJP4p1NrfF48N8g'
        },
        inbound: {
            url: config.baseUrl + '/mandrill/inbound',
            key: 'qDUZwx3qlIcbxj3SNeSCEw',
            relays: {
                'admin@payme4.ru': 'admin@norvik.eu',
                'support@payme4.ru': 'payme-support@norvik.eu'
            }
        }
    }
};
    
module.exports = config;
