(function() {
    'use strict';
    var module = angular.module('app.invoice.pay', []);
    
    module.controller('InvoicePayCtrl', ['$scope', '$routeParams', '$sce', 'Client', 'config', function($scope, $routeParams, $sce, client, config) {
        
        $scope.invoiceId = $routeParams.invoice_id;
        $scope.invoice = null;
        $scope.form_error = null;
        $scope.processing = false;
        $scope.card = {};
        
        // Get invoice
        
        client.invoices.get($scope.invoiceId).then(function(invoice) {
            $scope.invoice = invoice;
        }).catch(function (error) {
            $scope.error = error.message;
        });
        
        $scope.submit = function() {
            if ($scope.form.$valid) {
                $scope.form_error = null;
                $scope.processing = true;
                
                client.invoices.pay($scope.invoiceId, $scope.card)
                .then(function (transaction) {
                    // Fill 3ds hidden form and submit it
                    var form = $('form[name="form_3ds"]');
                    form.find('input[name="TermUrl"]').val(config.termUrl);
                    form.find('input[name="PaReq"]').val(transaction.PaReq);
                    form.find('input[name="MD"]').val(transaction.MD);
                    form.prop('action', transaction.acsUrl).submit();
                })
                .catch(function (error) {
                    $scope.form_error = error.message;
                })
                .finally(function() {
                    $scope.processing = false;                        
                });
            }
        };
        
       
    }]);
})();
