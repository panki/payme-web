(function() {
    'use strict';
    var module = angular.module('app.invoice.refuse-success', []);
    
    module.controller('InvoiceRefuseSuccessCtrl', ['$scope', '$routeParams',
        function($scope, $routeParams) {
            $scope.invoiceId = $routeParams.invoice_id;
        }]);
})();
