(function() {
    'use strict';
    var module = angular.module('app.invoice.cancel-success', []);
    
    module.controller('InvoiceCancelSuccessCtrl', ['$scope', '$routeParams',
        function($scope, $routeParams) {
            $scope.invoiceId = $routeParams.invoice_id;
        }]);
})();
