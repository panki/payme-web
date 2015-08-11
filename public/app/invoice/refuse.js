(function() {
    'use strict';
    var module = angular.module('app.invoice.refuse', []);

    module.controller('InvoiceRefuseCtrl', ['$scope',
        function($scope) {
            var $parent = $scope.$parent;

            $scope.invoice = angular.copy($parent.invoice);
            $scope.submitting = false;
            
            
            $scope.setCode = function(code) {
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
            $scope.setCode($scope.code);
            
            $scope.onTextareaFocus = function() {
                if ($scope.code == 'other') {
                    return;
                }

                $scope.code = code;
                $scope.setCode('other');
            };

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
})();
