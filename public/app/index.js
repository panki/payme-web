(function() {
    'use strict';
    var module = angular.module('app.index', ['ngRoute']);

    module.config(['$routeProvider', '$locationProvider',
        function($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: '/public/build/templates/index.html'
                })
                .when('/howto', {
                    templateUrl: '/public/build/templates/howto.html'
                })
                .when('/support', {
                    templateUrl: '/public/build/templates/support.html'
                })
                .when('/advantages', {
                    templateUrl: '/public/build/templates/advantages.html'
                });
        }
    ]);

    module.controller('IndexCtrl', [function() {
    }]);
})();
