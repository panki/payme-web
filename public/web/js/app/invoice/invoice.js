(function() {
    'use strict';

    var module = angular.module('app.invoice', [
        'ngRoute',
        'app.invoice.new',
        'app.invoice.pay']);

    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/invoices', {
                templateUrl: '/public/build/templates/index.html',
                controller: 'InvoiceCtrl'
            })
            .when('/invoices/new', {
                templateUrl: '/public/build/templates/new.html',
                controller: 'InvoiceNewCtrl'
            })
            .when('/invoices/pay', {
                templateUrl: '/public/build/templates/pay.html',
                controller: 'InvoicePayCtrl'
            });
    }]);
    
    module.controller('InvoiceCtrl', ['$scope', function($scope) {
        // ng-init:
        // $scope.title
    }])
})();
