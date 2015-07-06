(function() {
    'use strict';
    var app = angular.module('app', ['ui.mask', 'ui.bootstrap',
        'client', 
        'app.directives',
        'app.invoice',
        'app.invoice.send',
        'app.invoice_new']);

    app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
    }]);
})();
