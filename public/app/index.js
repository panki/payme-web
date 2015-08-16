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
    
    module.controller('InvoiceNewCtrl', ['$scope', '$location', 'Client',
        function($scope, $location, client) {
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
                client.invoices.create($scope.invoice).then(function(invoice) {
                    window.location.href = '/invoice_created';
                }).catch(function(error) {
                    alert(error);
                }).finally(function() {
                    $scope.submitting = false;
                });
            };
        }]);
})();
