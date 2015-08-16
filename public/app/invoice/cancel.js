(function() {
    'use strict';
    var module = angular.module('app.invoice.cancel', []);

    module.controller('InvoiceCancelCtrl', ['$scope', '$modal',
        function($scope, $modal) {
            var $parent = $scope.$parent;

            $scope.invoice = angular.copy($parent.invoice);
            $scope.submitting = false;

            $scope.confirm = function() {
                var instance = $modal.open({
                    animation: $scope.animationsEnabled,
                    controller: 'InvoiceCancelConfirmCtrl',
                    resolve: {
                        items: function() {
                            return $scope.items;
                        }
                    },
                    template: '<div class="modal-header">' +
                              '<h2 class="modal-title">Подтвердите отмену счета</h2>' +
                              '</div>' +
                              '<div class="modal-body">' +
                              '<p>Вы уверены, что хотите отменить счет?</p>' +
                              '</div>' +
                              '<div class="modal-footer">' +
                              '<button class="btn btn-primary" type="button" ng-click="ok()">' +
                              'ДА, ОТМЕНИТЬ</button>' +
                              '<button class="btn btn-warning" type="button" ng-click="cancel()">' +
                              'ЗАКРЫТЬ</button>' +
                              '</div>'
                });

                instance.result.then(function() {
                    $scope.submit();
                }, function() {
                    console.log('Dimissed');
                });
            };

            $scope.submit = function() {
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

    module.controller('InvoiceCancelConfirmCtrl', ['$scope', '$modalInstance',
        function($scope, $modalInstance) {
            $scope.ok = function() {
                $modalInstance.close();
            };

            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
        }]);
})();
