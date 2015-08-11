(function() {
    'use strict';
    var module = angular.module('app.invoice.cancel', []);

    module.controller('InvoiceCancelCtrl', ['$scope',
        function($scope) {
            var $parent = $scope.$parent;

            $scope.invoice = angular.copy($parent.invoice);
            $scope.submitting = false;

            $scope.submit = function(valid) {
                if (!valid) {
                    console.log('Submit aborted, not valid');
                    return;
                }
                if ($scope.submitting) {
                    console.log('Submit aborted, already submitting');
                    return;
                }

                $scope.submitting = true;
                console.log('Cancelling an invoice', $scope.invoice.id);

                $parent.cancelInvoice().then(function() {
                    $parent.reloadChild();
                }).catch(function(error) {
                    $parent.onError(error);
                }).finally(function() {
                    $scope.submitting = false;
                });
            };

            $scope.showInvoice = function() {
                $scope.reloadChild();
            };
        }]);
})();
