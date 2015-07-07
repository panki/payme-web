(function() {
    'use strict';
    var module = angular.module('app.invoice_new', ['ngRoute']);

    module.config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
            $locationProvider.html5Mode(true);

            $routeProvider
                .when('/invoice_new', {
                    templateUrl: '/public/build/app/invoice_new/index.html'
                })
                .when('/invoice_new/success', {
                    templateUrl: '/public/build/app/invoice_new/success.html',
                    controller: 'InvoiceNewSuccessCtrl'
                });
        }]);

    module.controller('InvoiceNewCtrl', ['$scope', '$location', 'Client',
        function($scope, $location, client) {
            var email = $location.search().email || '';
            $scope.invoice = {
                amount: 100,
                //owner: 'Ivan',
                //owner_email: 'ivan.korobkov@gmail.com',
                //payer: 'panki',
                payer_email: email
                //text: 'Hello, world'
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
                client.invoices.create($scope.invoice).then(function(invoice) {
                    console.log(invoice);
                    $location.path('invoice_new/success');
                }).catch(function(error) {
                    alert(error);
                }).finally(function() {
                    $scope.submitting = false;
                });
            };
        }]);

    module.controller('InvoiceNewSuccessCtrl', ['$scope', function($scope) {
        console.log('Success');
    }]);
})();