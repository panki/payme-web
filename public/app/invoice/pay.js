(function() {
    'use strict';
    var module = angular.module('app.invoice.pay', []);
    
    module.controller('InvoicePayCtrl', ['$scope', 'Invoices', function($scope, Invoices) {
        console.log(Invoices);
        $scope.title = 'Pay controller';
    }]);
})();
