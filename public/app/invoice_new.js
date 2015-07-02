(function() {
    'use strict';
    var module = angular.module('app.invoice_new', ['ngRoute']);

    module.config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
            $locationProvider.html5Mode(true);

            $routeProvider
                .when('/invoice_new', {
                    templateUrl: '/public/build/app/invoice_new/index.html',
                    controller: 'InvoiceNewCtrl'
                })
                .when('/invoice_new/success', {
                    templateUrl: '/public/build/app/invoice_new/success.html',
                    controller: 'InvoiceNewSuccessCtrl'
                });
        }]);

    module.controller('InvoiceNewCtrl', ['$scope', '$location', 'Client',
        function($scope, $location, client) {
            $scope.invoice = {};
            $scope.saving = false;

            $scope.submit = function() {
                if ($scope.saving) {
                    return;
                }

                client.invoices.create($scope.invoice).then(function(invoice) {
                    console.log(invoice);
                    $location.path('invoice_new/success');
                }).catch(function(error) {
                    alert(error);
                }).finally(function() {
                    $scope.saving = false;
                });
            };
        }]);

    module.controller('InvoiceNewSuccessCtrl', ['$scope', function($scope) {
        console.log('Success');
    }]);
})();
