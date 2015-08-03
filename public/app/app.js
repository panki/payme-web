(function() {
    'use strict';
    var app = angular.module('app', ['ui.bootstrap',
        'app.index',
        'app.client',
        'app.directives',
        'app.invoice',
        'app.invoice_new',
        'autosizeInput']);

    app.config(['$routeProvider', '$locationProvider', '$httpProvider',
        function($routeProvider, $locationProvider, $httpProvider) {
            $locationProvider.html5Mode(true);
            $httpProvider.defaults.withCredentials = true;
        }]);
})();
