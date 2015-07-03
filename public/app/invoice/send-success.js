(function() {
    'use strict';
    var module = angular.module('app.invoice.send-success', []);
    
    module.controller('InvoiceSendSuccessCtrl', ['$scope', '$routeParams',
        function($scope, $routeParams) {
            $scope.invoiceId = $routeParams.invoice_id;
        }]);
})();
