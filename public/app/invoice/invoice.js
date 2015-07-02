(function() {
    'use strict';

    var module = angular.module('app.invoice', [
        'ngRoute',
        'app.invoice.new',
        'app.invoice.pay',
        'app.invoice.show']);

    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/invoice/:invoice_id/', {
                templateUrl: '/public/build/app/invoice/show.html',
                controller: 'InvoiceShowCtrl'
            })
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
    
    module.controller('InvoiceCtrl', ['$scope', function($scope) {
        // ng-init:
        // $scope.title
    }]);
})();
