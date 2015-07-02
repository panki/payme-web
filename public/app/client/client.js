(function() {
    'use strict';
    
    angular.module('client', []).factory('Client', ['$http', 'apiUrl', function($http, apiUrl) {
        
        var self = this;
        
        // Internal methods
        
        this._request = function(method, url, session, data) {
            var req = {
                method: method,
                url: apiUrl + url,
                headers: {
                    'Authorization': 'session ' + session
                },
                data: data
            };
            return $http(req)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (response) {
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
        
        this._get = function (url, session, data) {
            return self._request('GET', url, session, data);
        };
        
        this._post = function (url, session, data) {
            return self._request('POST', url, session, data);
        };
        
        // Invoices
        
        this.invoices = {
            'get': function (invoice_id, session) {
                return self._get('/invoices/'+invoice_id, session);
            }
        };
        
        return this;
    }]);
})();
