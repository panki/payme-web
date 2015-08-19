(function() {
    'use strict';

    angular.module('app.client', []).factory('Client', ['$http', '$httpParamSerializer', '$interval', 'config',
        function($http, $httpParamSerializer, $interval, config) {
            var self = this;
            var apiUrl = config.apiUrl;
            self.sessionId = null;

            function get(url, data) {
                var req = {
                    method: 'GET',
                    url: apiUrl + url,
                    headers: {}
                };
                if (data) {
                    req.data = data;
                }
                if (self.sessionId) {
                    req.headers.Authorization = 'session ' + self.sessionId;
                }

                return $http(req).then(handleResponse).catch(handleError);
            }

            function post(url, data) {
                var req = {
                    method: 'POST',
                    url: apiUrl + url,
                    data: $httpParamSerializer(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };
                if (self.sessionId) {
                    req.headers.Authorization = 'session ' + self.sessionId;
                }

                return $http(req).then(handleResponse).catch(handleError);
            }

            function handleResponse(response) {
                return response.data;
            }
            
            function handleError(response) {
                var e = null;
                switch (response.status) {
                    case 0:
                        throw new Error('Сетевая ошибка');
                    case 404:
                        e = new Error('Ресурс не найден');
                        e.status = 404;
                        throw e;
                    case 422:
                        var msg = response.data.message;
                        console.log(response.data);
                        if (response.data.errors) {
                            angular.forEach(response.data.errors, function(value) {
                                msg += '. ';
                                msg += value;
                            });
                        }
                        e = new Error(msg);
                        e.status = 422;
                        throw e;
                    case 500:
                        e = new Error('Внутренняя ошибка');
                        e.status = 500;
                        throw e;
                    default:
                        throw new Error('Неизвестная ошибка');
                }
            }
            
            // Auth
            
            this.auth = {
                pingSession: function() {
                    return post('/auth/touch_session');
                },
                startSessionPing: function() {
                    $interval(self.auth.pingSession, config.sessionPingInterval || 5000);
                }
            };

            // Invoices

            this.invoices = {
                get: function(invoiceId) {
                    return get('/invoices/' + invoiceId);
                },
                create: function(newForm) {
                    return post('/invoices/new', newForm);
                },
                send: function(invoiceId, sendForm) {
                    return post('/invoices/send/' + invoiceId, sendForm);
                },
                pay: function(invoiceId, sendForm) {
                    return post('/invoices/pay/' + invoiceId, sendForm);
                },
                calcFee: function(invoiceId, senderCardNumber) {
                    return post('/invoices/calc_fee/' + invoiceId, {sender_card_number: senderCardNumber});
                },
                refuse: function(invoiceId, reason) {
                    return post('/invoices/refuse/' + invoiceId, {reason: reason});
                },
                cancel: function(invoiceId) {
                    return post('/invoices/cancel/' + invoiceId);
                }
            };
            
            // Banks
            
            this.banks = {
                lookup: function (bin) {
                    return get('/banks/lookup/' + bin);
                }
            };

            return this;
        }]);
})();
