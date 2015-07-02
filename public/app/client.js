(function() {
    'use strict';

    angular.module('client', []).factory('Client', ['$http', 'apiUrl', function($http, apiUrl) {
        var self = this;
        self.sessionId = null;

        // Internal methods

        this._request = function(method, url, session, data) {
            var req = {
                method: method,
                url: apiUrl + url,
                headers: {},
                data: data
            };
            if (self.sessionId) {
                req.headers.Authorization = 'session ' + session;
            }

            return $http(req).then(function(response) {
                return response.data;
            }).catch(function(response) {
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
            });
        };

        this._get = function(url, data) {
            return self._request('GET', url, data);
        };

        this._post = function(url, session, data) {
            return self._request('POST', url, data);
        };

        // Invoices

        this.invoices = {
            getById: function(invoiceId) {
                return self._get('/invoices/' + invoiceId);
            },
            create: function(newForm) {
                return self._post('/invoices/new', '', newForm);
            },
            send: function(invoiceId, sendForm) {
                return self._post('/invoices/send/' + invoiceId, sendForm);
            }
        };

        return this;
    }]);
})();
