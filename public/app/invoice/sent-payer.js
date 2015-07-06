(function() {
    'use strict';
    var module = angular.module('app.invoice.sent-payer', []);
    
    module.controller('InvoicePayCtrl', ['$scope', '$modal', 'config', 'Client', function($scope, $modal, config, client) {
        var $parent = $scope.$parent;
        $scope.invoice = angular.copy($parent.invoice);
        
        $scope.form_error = null;
        $scope.submitting = false;
        $scope.card = {};
        $scope.fee = {
            loading: false,
            calculated: false,
            value: null
        };
        
        // Calculate fee
        
        $scope.$watch('card.number', function() {
            $scope.calcFee();
        }, true);
        
        $scope.calcFee = function () {
            $scope.fee.calculated = false;
            $scope.fee.value = null;
            if ($scope.card.number) {
                $scope.fee.loading = true;
                client.invoices.calcFee($scope.invoiceId, $scope.card.number).then(function (result) {
                    $scope.fee.value = result.fee;
                    $scope.fee.calculated = true;
                }).catch(function (error) {
                    alert(error.message);
                }).finally(function() {
                    $scope.fee.loading = false;                        
                });
            }
        };
        
        // Refuse modal dialog
        
        $scope.openRefuseDialog = function () {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: '/public/build/app/invoice/modals/refuse.html',
                controller: 'InvoiceRefuseCtrl',
                size: null,
                resolve: {
                    invoiceId: function () { return $scope.invoiceId; }
                }
            });
            
            modalInstance.result.then(function(reason) {
                $parent.refuseInvoice(reason).then(function() {
                    $parent.reloadChild();
                }).catch(function(error) {
                    $parent.onError(error);
                });
            });
        };
        
        $scope.submit = function() {
            if ($scope.form.$valid) {
                
                if (!$scope.fee.calculated) {
                    return $scope.calcFee();
                }
                
                $scope.submitting = true;
                
                $parent.payInvoice({
                    sender_card_number: $scope.card.number,
                    sender_card_cvv: $scope.card.cvv,
                    sender_card_exp_month: $scope.card.exp_date.substring(0,2),
                    sender_card_exp_year: '20' + $scope.card.exp_date.substring(2,4)
                })
                .then(function (transaction) {
                    // Fill 3ds hidden form and submit it
                    var form = $('form[name="form_3ds"]');
                    form.find('input[name="TermUrl"]').val(config.termUrl);
                    form.find('input[name="PaReq"]').val(transaction.PaReq);
                    form.find('input[name="MD"]').val(transaction.MD);
                    form.prop('action', transaction.acsUrl).submit();
                })
                .catch(function (error) {
                    $parent.onError(error);
                })
                .finally(function() {
                    $scope.submitting = false;                        
                });
            }
        };
        
       
    }]);
    
    module.controller('InvoiceRefuseCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance) {
        $scope.reason = null;
        $scope.other_reason = null;
        $scope.refuse = function () {
            if ($scope.refuse_form.$valid) {
                var reason = $scope.reason === 'other' ? $scope.other_reason : $scope.reason;
                $modalInstance.close(reason);
            }
        };
        
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
    
})();
