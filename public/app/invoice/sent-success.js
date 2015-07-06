(function() {
    'use strict';
    var module = angular.module('app.invoice.sent-success', []);
    
    module.controller('InvoiceSendSuccessCtrl', ['$scope', '$routeParams',
        function($scope, $routeParams) {
            $scope.invoiceId = $routeParams.invoice_id;
        }]);
})();
