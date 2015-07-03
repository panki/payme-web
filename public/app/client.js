(function() {
    'use strict';

    angular.module('client', []).factory('Client', ['$http', '$httpParamSerializer', 'config',
        function($http, $httpParamSerializer, config) {
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
                console.log(response);
                switch (response.status) {
                    case 0:
                        throw new Error('Ошибка безопасности');
                    case 404:
                        throw new Error('Ресурс не найден');
                    case 422:
                        throw new Error(response.data.message);
                    case 500:
                        throw new Error('Внутренняя ошибка');
                    default:
                        throw new Error('Неизвестная ошибка');
                }
            }

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
                }
            };

            return this;
        }]);
})();
