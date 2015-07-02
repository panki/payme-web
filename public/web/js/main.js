// Main module.

(function() {
    'use strict';

    var app = angular.module('app', ['ngRoute']);
    app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        
        $routeProvider
            .when('/', {
                templateUrl: '/public/web/templates/index.html',
                controller: 'IndexCtrl'
            })
            .when('/invoices/new', {
                templateUrl: '/public/web/templates/new.html',
                controller: 'NewCtrl'
            })
            .when('/invoices/pay', {
                templateUrl: '/public/web/templates/pay.html',
                controller: 'PayCtrl'
            });
    }]);

    app.controller('MainCtrl', ['$scope', function($scope) {
        $scope.main = 'Main controller';
    }]);
    
    app.controller('IndexCtrl', ['$scope', function($scope) {
        $scope.title = 'Index controller';
    }]);
    
    app.controller('NewCtrl', ['$scope', function($scope) {
        $scope.title = 'New controller';
    }]);
    
    app.controller('PayCtrl', ['$scope', function($scope) {
        $scope.title = 'Pay controller';
    }]);
})();
