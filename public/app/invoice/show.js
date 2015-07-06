(function() {
    'use strict';
    var module = angular.module('app.invoice.show', []);
    
    module.controller('InvoiceShowCtrl', ['$scope', '$routeParams', '$modal', '$location', 'Client', function($scope, $routeParams, $modal, $location, client) {
        $scope.invoiceId = $routeParams.invoice_id;
        $scope.loading = true;
        
        client.invoices.get($scope.invoiceId).then(function(invoice) {
            $scope.invoice = invoice;
        }).catch(function (error) {
            alert(error.message);
        }).finally(function() {
            $scope.loading = false;
        });
        
        // Cancel modal dialog
        
        $scope.openCancelDialog = function () {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: '/public/build/app/invoice/modals/cancel.html',
                controller: 'InvoiceCancelCtrl',
                size: null,
                resolve: {
                    invoiceId: function () { return $scope.invoiceId; }
                }
            });
            
            modalInstance.result.then(function (cancelled) {
                if (cancelled) {
                    $location.path('invoice/' + $scope.invoiceId + '/cancel/success');
                }
            });
        };
        
    }]);
    
    module.controller('InvoiceCancelCtrl', ['$scope', '$modalInstance', 'Client', 'invoiceId', function($scope, $modalInstance, client, invoiceId) {
        $scope.doCancel = function () {
            client.invoices.cancel(invoiceId).then(function (invoice) {
                $modalInstance.close(true);
            }).catch(function (error) {
                alert(error.message);
            });
        };
        
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
})();
