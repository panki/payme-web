(function() {
    'use strict';
    var module = angular.module('app.index', ['ngRoute']);

    module.config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
            $routeProvider
            .when('/', {
                templateUrl: '/public/build/app/index.html'
            })
            .when('/howto', {
                templateUrl: '/public/build/app/howto.html'
            })
            .when('/support', {
                templateUrl: '/public/build/app/support.html'
            })
            .when('/advantages', {
                templateUrl: '/public/build/app/advantages.html'
            });
        }
    ]);

    module.controller('IndexCtrl', ['$scope', '$location',
        function($scope, $location) {
            $scope.newInvoice = function () {
                if ($scope.email) {
                    $location.path('/invoice_new').search({email: $scope.email});
                } 
            }
        }
    ]);
})();
