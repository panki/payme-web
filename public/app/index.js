(function() {
    'use strict';
    var module = angular.module('app.index', ['ngRoute']);

    module.config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
            $locationProvider.html5Mode(true);
            $routeProvider
            .when('/', {
                templateUrl: '/public/build/templates/index.html'
            })
            .when('/invoice/created', {
                templateUrl: '/public/build/templates/invoice/created.html'
            })
            .when('/tariffs', {
                templateUrl: '/public/build/templates/tariffs.html'
            })
            .when('/terms', {
                templateUrl: '/public/build/templates/terms.html'
            })
            .when('/faq', {
                templateUrl: '/public/build/templates/faq.html'
            });
        }
    ]);

    module.controller('IndexCtrl', [function() {
    }]);
    
    module.controller('InvoiceNewCtrl', ['$rootScope', '$scope', '$location', 'Client',
        function($rootScope, $scope, $location, client) {
            $scope.invoice = {
                amount: 100
            };
            $scope.submitting = false;
            
            $scope.submit = function(valid) {
                console.log(valid);
                if (!valid) {
                    return;
                }
                
                if ($scope.submitting) {
                    return;
                }
                
                $scope.submitting = true;
                $rootScope.invoice = $scope.invoice;
                
                client.invoices.create($scope.invoice).then(function(invoice) {
                    $location.path('/invoice/created');
                }).catch(function(error) {
                    alert(error);
                }).finally(function() {
                    $scope.submitting = false;
                });
            };
        }]);
})();
