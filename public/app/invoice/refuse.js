(function() {
    'use strict';
    var module = angular.module('app.invoice.refuse', []);

    module.controller('InvoiceRefuseCtrl', ['$scope', '$modal',
        function($scope, $modal) {
            var $parent = $scope.$parent;

            $scope.invoice = angular.copy($parent.invoice);
            $scope.submitting = false;

            $scope.updateReasonWithCode = function(code) {
                switch (code) {
                    case 'paid':
                        $scope.reason = 'Счет уже оплачен.';
                        break;
                    case 'stranger':
                        $scope.reason = 'Не знаю, кто этот человек.';
                        break;
                    default:
                        $scope.reason = '';
                        setTimeout(function() {
                            document.getElementById('reason-textarea').focus();
                        }, 100);
                        break;
                }
            };
            $scope.code = 'paid';
            $scope.updateReasonWithCode($scope.code);

            $scope.onTextareaFocus = function() {
                if ($scope.code === 'other') {
                    return;
                }

                $scope.code = 'other';
                $scope.updateReasonWithCode('other');
            };

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
                              '<h2 class="modal-title">Подтвердите отказ от оплаты счета</h2>' +
                              '</div>' +
                              '<div class="modal-body">' +
                              '<p>Вы уверены, что хотите отказаться оплачивать счет?</p>' +
                              '</div>' +
                              '<div class="modal-footer">' +
                              '<button class="btn btn-primary" type="button" ng-click="ok()">' +
                              'ДА, ОТКАЗАТЬСЯ</button>' +
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
                console.log('Refusing an invoice', $scope.invoice.id);
                console.log($scope.reason);

                $parent.refuseInvoice($scope.reason).then(function() {
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
    
    module.controller('InvoiceRefuseConfirmCtrl', ['$scope', '$modalInstance',
        function($scope, $modalInstance) {
            $scope.ok = function() {
                $modalInstance.close();
            };

            $scope.cancel = function() {
                $modalInstance.dismiss();
            };
        }]);
})();
