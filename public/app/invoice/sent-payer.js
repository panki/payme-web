(function() {
    'use strict';
    var module = angular.module('app.invoice.sent-payer', []);

    function endsWith(s, suffix) {
        return s.indexOf(suffix, s.length - suffix.length) !== -1;
    }
    
    module.controller('InvoicePayCtrl', ['$scope', '$location', '$modal', 'config', 'Client', function($scope, $location, $modal, config, client) {
        var $parent = $scope.$parent;
        $scope.invoice = angular.copy($parent.invoice);
        
        $scope.form_error = null;
        $scope.submitting = false;
        $scope.card = {
            number: null,
            exp_date: null,
            cvv: null
        };
        $scope.fee = {
            loading: false,
            calculated: false,
            value: null
        };
        
        // Calculate fee
        
        $scope.$watch('card.number', function() {
            $scope.form.card_number.$setValidity('commission', true);
            $scope.calcFee();
        }, true);
        
        $scope.calcFee = function () {
            if ($scope.fee.loading) { return; }
            $scope.fee.calculated = false;
            $scope.fee.value = null;
            if ($scope.card.number && $scope.form.card_number.$valid) {
                $parent.clearError();
                $scope.fee.loading = true;
                client.invoices.calcFee($scope.invoiceId, $scope.card.number.replace(/ /g, '')).then(function (result) {
                    $scope.fee.value = result.fee;
                    $scope.fee.tariff = '' + result.interest + '% от суммы, но не менее ' + Math.round(result.min) + ' ₽';
                    $scope.fee.calculated = true;
                    $scope.form.card_number.$setValidity('commission', true);
                }).catch(function (error) {
                    $scope.form.card_number.$setValidity('commission', false);
                }).finally(function() {
                    $scope.fee.loading = false;                   
                });
            }
        };
        
        // Refuse modal dialog
        
        $scope.openRefuseDialog = function () {
            $parent.showRefuse();
            window.scrollTo(0, 0);
        };
        
        $scope.clearError = function() {
            $parent.clearError();    
        };
        
        $scope.submit = function() {
            
            $scope.form.card_number.$setValidity('commission', true);
            
            if ($scope.form.$valid) {
                
                if (!$scope.fee.calculated) {
                    return $scope.calcFee();
                }
                
                $scope.submitting = true;
                $parent.clearError();
                
                $parent.payInvoice({
                    sender_card_number: $scope.card.number.replace(/ /g, ''),
                    sender_card_cvv: $scope.card.cvv,
                    sender_card_exp_month: $scope.card.exp_date.split('/')[0],
                    sender_card_exp_year: $scope.card.exp_date.split('/')[1]
                })
                .then(function (transaction) {
                    // Fill 3ds hidden form and submit it
                    var form = $('form[name="form_3ds"]');
                    form.find('input[name="TermUrl"]').val(config.termUrl + $scope.invoice.id+'/');
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

        // Handle refuse links.
        {
            var path = $location.path();
            var refuse = false;
            var newPath = null;

            if (endsWith(path, '/refuse')) {
                refuse = true;
                newPath = path.substring(0, path.length - '/refuse'.length);
            } else if (endsWith(path, '/refuse/')) {
                refuse = true;
                newPath = path.substring(0, path.length - '/refuse/'.length);
            }
            
            if (refuse) {
                $location.path(newPath);
                $scope.openRefuseDialog();
            }
        }
    }]);
})();
