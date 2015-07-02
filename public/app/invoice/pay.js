(function() {
    'use strict';
    var module = angular.module('app.invoice.pay', []);
    
    module.controller('InvoicePayCtrl', ['$scope', function($scope) {
        $scope.title = 'Pay controller';
    }]);
})();
