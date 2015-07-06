(function() {
    'use strict';
    var module = angular.module('app.invoice.sent-owner', []);
    
    module.controller('InvoiceSentOwnerCtrl', ['$scope', function($scope) {
        var $parent = $scope.$parent;
        $scope.invoice = angular.copy($parent.invoice);
    }]);
})();
