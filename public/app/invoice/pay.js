(function() {
    'use strict';
    var module = angular.module('app.invoice.pay', []);
    
    module.controller('InvoicePayCtrl', ['$scope', '$routeParams', '$modal', '$location', 'Client', 'config', function($scope, $routeParams, $modal, $location, client, config) {
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
            
            modalInstance.result.then(function (refused) {
                if (refused) {
                    $location.path('invoice/' + $scope.invoiceId + '/refuse/success');
                }
            });
        };
        
        $scope.submit = function() {
            if ($scope.form.$valid) {
                
                if (!$scope.fee.calculated) {
                    return $scope.calcFee();
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
    
    module.controller('InvoiceRefuseCtrl', ['$scope', '$modalInstance', 'Client', 'invoiceId', function($scope, $modalInstance, client, invoiceId) {
        $scope.reason = null;
        $scope.other_reason = null;
        $scope.refuse = function () {
            if ($scope.refuse_form.$valid) {
                var reason = $scope.reason === 'other' ? $scope.other_reason : $scope.reason;
                client.invoices.refuse(invoiceId, reason).then(function (invoice) {
                    $modalInstance.close(true);
                }).catch(function (error) {
                    alert(error.message);
                });
            }
        };
        
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
    
})();
