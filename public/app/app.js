(function() {
    'use strict';
    var app = angular.module('app', ['ui.bootstrap', 'ui.bootstrap.datetimepicker', 'credit-cards',
        'app.index',
        'app.client',
        'app.filters',
        'app.services',
        'app.directives',
        'app.invoice',
        'app.invoice_new',
        'autosizeInput', 'ui.mask']);

    app.config(['$routeProvider', '$locationProvider', '$httpProvider',
        function($routeProvider, $locationProvider, $httpProvider) {
            $locationProvider.html5Mode(true);
            $httpProvider.defaults.withCredentials = true;
        }]);
})();
