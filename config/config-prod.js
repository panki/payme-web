var config = {
    apiUrl: 'https://payme4.ru/api',    // No trailing slash.
    baseUrl: 'https://payme4.ru',       // No trailing slash.
    redis: {
        host: '10.0.0.10',
        port: 6379,
        db: 0
    },
    proxies: ['127.0.0.1'],
    auth: {
        deviceTtlMs: 10 * 365 * 24 * 3600 * 1000    // 10 years.
    },
    cookies: {
        secret: 'de7fcc545b719033e70adde82ee27d61',
        utmTtlMs: 365 * 24 * 3600 * 1000            // 1 year.
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
            'pay@payme4.ru'
        ],
        inboundDomain: 'payme4.ru',
        mailDomain: 'mail.payme4.ru',
        from: 'PayMe4 <invoice@payme4.ru>',
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
    },
    analytics: {
        ga: {
            id: 'UA-68482734-1'
        },
        gtm: {
            id: 'GTM-53V9ZV'
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
                'admin@payme4.ru': 'admin@mail.payme4.ru',
                'support@payme4.ru': 'support@mail.payme4.ru'
            }
        }
    }
};
    
module.exports = config;
