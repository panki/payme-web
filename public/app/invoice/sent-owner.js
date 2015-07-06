(function() {
    'use strict';
    var module = angular.module('app.invoice.sent-owner', []);

    module.controller('InvoiceSentOwnerCtrl', ['$scope', '$modal', function($scope, $modal) {
        var $parent = $scope.$parent;
        $scope.invoice = angular.copy($parent.invoice);

        $scope.openCancelDialog = function() {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: '/public/build/app/invoice/modals/cancel.html',
                controller: 'InvoiceCancelCtrl',
                size: null,
                resolve: {
                    invoiceId: function() {
                        return $scope.invoiceId;
                    }
                }
            });
            
            modalInstance.result.then(function() {
                $parent.cancelInvoice().then(function() {
                    $parent.reloadChild();
                }).catch(function(error) {
                    $parent.onError(error);
                })
            });
        };
    }]);

    module.controller('InvoiceCancelCtrl', ['$scope', '$modalInstance',
        function($scope, $modalInstance) {
            $scope.doCancel = function() {
                $modalInstance.close();
            };

            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
        }]);
})();
