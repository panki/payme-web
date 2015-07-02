(function() {
    'use strict';
    var app = angular.module('app', [
        'client', 
        'app.invoice',
        'app.invoice_new']);

    app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
    }]);
})();
