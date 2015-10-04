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
    
    module.controller('InvoiceNewCtrl', ['$rootScope', '$scope', '$location', '$timeout', 'Client',
        function($rootScope, $scope, $location, $timeout, client) {
            $scope.invoice = {
                amount: 100
            };
            $scope.submitting = false;
            
            $scope.submit = function() {
                if ($scope.submitting) {
                    return;
                }
                
                if ($scope.invoice.payer_email === $scope.invoice.owner_email) {
                    $scope.form.owner_email.$setValidity('emails', false);
                }
                
                if (!$scope.form.$valid) {
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
