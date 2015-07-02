(function() {
    'use strict';

    var module = angular.module('app.invoiceNew', ['ngRoute']);

    module.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        
        $routeProvider
            .when('/invoices/new', {
                templateUrl: '/public/build/app/invoice-new/index.html',
                controller: 'IndexCtrl'
            })
            .when('/invoices/new/success', {
                templateUrl: '/public/build/app/invoice-new/success.html',
                controller: 'SuccessCtrl'
            });
    }]);
    
    module.controller('IndexCtrl', ['$scope', function($scope) {
        console.log('Index');
        
        $scope.submit = function() {
            console.log('Submitted');
        }
    }]);
    
    module.controller('SuccessCtrl', ['$scope', function($scope) {
        console.log('Success');
    }]);
})();
