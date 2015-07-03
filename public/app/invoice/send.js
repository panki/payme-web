(function() {
    'use strict';
    var module = angular.module('app.invoice.send', []);

    module.controller('InvoiceSendCtrl', ['$scope', '$routeParams', '$location', 'Client',
        function($scope, $routeParams, $location, client) {
            $scope.invoiceId = $routeParams.invoice_id;
            $scope.loading = true;
            $scope.submitting = false;
            $scope.formData = {
                expire_at: '2016-01-01'
            };
            
            client.invoices.get($scope.invoiceId).then(function(invoice) {
                console.log(invoice);
                $scope.invoice = invoice;
            }).catch(function(error) {
                alert(error.message);
            }).finally(function() {
                $scope.loading = false;
            });
            
            $scope.submit = function(valid) {
                console.log('sending', valid, $scope.formData);
                if (!valid) {
                    return;
                }
                if ($scope.submitting) {
                    return;
                }
                
                $scope.submitting = true;
                client.invoices.send($scope.invoiceId, $scope.formData).then(function(invoice) {
                    $location.path('invoice/' + $scope.invoiceId + '/send/success');
                }).catch(function(error) {
                    alert(error.message);
                }).finally(function() {
                    $scope.submitting = false;
                });
            };
        }]);
})();
