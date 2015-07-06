(function() {
    'use strict';
    var module = angular.module('app.invoice.pay', []);
    
    module.controller('InvoicePayCtrl', ['$scope', '$routeParams', '$modal', 'Client', 'config', function($scope, $routeParams, $modal, client, config) {
        
        $scope.invoiceId = $routeParams.invoice_id;
        $scope.invoice = null;
        $scope.form_error = null;
        $scope.loading = true;
        $scope.submitting = false;
        $scope.card = {};
        $scope.fee = {
            loading: false,
            calculated: false,
            value: null
        };
        
        // Get invoice
        
        client.invoices.get($scope.invoiceId).then(function(invoice) {
            $scope.invoice = invoice;
        }).catch(function (error) {
            alert(error.message);
        }).finally(function() {
            $scope.loading = false;
        });
        
        
        // Calculate fee
        
        $scope.$watch('card.number', function() {
            $scope.calc_fee();
        }, true);
        
        $scope.calc_fee = function () {
            $scope.fee.calculated = false;
            $scope.fee.value = null;
            if ($scope.card.number) {
                $scope.fee.loading = true;
                client.invoices.calc_fee($scope.invoiceId, $scope.card.number).then(function (result) {
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
        
        $scope.open_refuse_dialog = function () {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: '/public/build/app/invoice/modals/refuse.html',
                controller: 'InvoiceRefuseCtrl',
                size: null,
                resolve: {}
            });

            modalInstance.result.then(function (refuse_reason) {
                //$scope.selected = selectedItem;
            });
        };
        
        $scope.submit = function() {
            if ($scope.form.$valid) {
                
                if (!$scope.fee.calculated) {
                    return $scope.calc_fee();
                }
                
                $scope.submitting = true;
                
                client.invoices.pay($scope.invoiceId, {
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
                    alert(error.message);
                })
                .finally(function() {
                    $scope.submitting = false;                        
                });
            }
        };
        
       
    }]);
    
    module.controller('InvoiceRefuseCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance) {
        $scope.refuse = function () {
            $modalInstance.close($scope.reason);
        };
        
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
    
})();
