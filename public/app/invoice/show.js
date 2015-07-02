(function() {
    'use strict';
    var module = angular.module('app.invoice.show', []);
    
    module.controller('InvoiceShowCtrl', ['$scope', '$routeParams', 'Client', function($scope, $routeParams, client) {
        // session_id comes from ng-init
        $scope.invoice_id = $routeParams.invoice_id;
        $scope.title = 'Show controller';
        
        client.invoices.get($scope.invoice_id, $scope.session_id).then(function(invoice) {
            $scope.invoice = invoice;
        }).catch(function (error) {
            $scope.error = error.message;
        });
    }]);
})();
