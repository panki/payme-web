(function() {
    'use strict';

    var module = angular.module('app.invoice', [
        'ngRoute',
        'app.invoice.new',
        'app.invoice.pay']);

    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/invoices', {
                templateUrl: '/public/build/app/invoice/index.html',
                controller: 'InvoiceCtrl'
            })
            .when('/invoices/new', {
                templateUrl: '/public/build/app/invoice/new.html',
                controller: 'InvoiceNewCtrl'
            })
            .when('/invoices/pay', {
                templateUrl: '/public/build/app/invoice/pay.html',
                controller: 'InvoicePayCtrl'
            });
    }]);
    
    module.controller('InvoiceCtrl', ['$scope', '$location', function($scope) {
        console.log($scope);
    }]);
})();
