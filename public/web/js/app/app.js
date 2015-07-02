(function() {
    'use strict';
    var app = angular.module('app', [
        'payme', 
        'app.invoice']);

    app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/', {
                templateUrl: '/public/build/templates/index.html',
                controller: 'IndexCtrl'
            });
    }]);

    app.controller('MainCtrl', ['$scope', function($scope) {
        $scope.main = 'Main controller';
    }]);

    app.controller('IndexCtrl', ['$scope', function($scope) {
        $scope.title = 'Index controller';
    }]);
})();
