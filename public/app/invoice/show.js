(function() {
    'use strict';
    var module = angular.module('app.invoice.show', []);
    
    module.controller('InvoiceShowCtrl', ['$scope', '$routeParams', 'Client', function($scope, $routeParams, client) {
        // session comes from ng-init
        $scope.invoice_id = $routeParams.invoice_id;
        $scope.title = 'Show controller';
        $scope.loading = true;
        
        client.invoices.get($scope.invoice_id).then(function(invoice) {
            $scope.invoice = invoice;
        }).catch(function (error) {
            alert(error.message);
        }).finally(function() {
            $scope.loading = false;
        });
    }]);
})();
