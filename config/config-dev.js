var config = {
    apiUrl: 'http://dev.payme4.ru/api',    // No trailing slash.
    baseUrl: 'http://dev.payme4.ru',       // No trailing slash.
    redis: {
        host: '127.0.0.1',
        port: 6379,
        db: 0
    },
    proxies: ['127.0.0.1'],
    auth: {
        deviceTtlMs: 10 * 365 * 24 * 3600 * 1000    // 10 years.
    },
    client: {
        defaultUserAgent: 'Payme web client',
        devices: {
            'Payme web client': '00000000-0000-4000-A000-000000000001',
            'Mandrill-Webhook/1.0': '00000000-0000-4000-A000-000000000002'
        }
    },
    mail: {
        invoiceCreateAddresses: [
            'pay@dev.payme4.ru'
        ],
        inboundDomain: 'dev.payme4.ru',
        mailDomain: 'mail.payme4.ru',
        from: 'PayMe4 <invoice@dev.payme4.ru>',
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
            key: 'gER36Q6g9EF5gruFuMgFXA'
        },
        inbound: {
            url: config.baseUrl + '/mandrill/inbound',
            key: 'F9XKW_CnFPSaJAVWqaDuZQ',
            relays: {
                'admin@dev.payme4.ru': 'admin@norvik.eu',
                'support@dev.payme4.ru': 'payme-support@norvik.eu'
            }
        }
    }
};

module.exports = config;
