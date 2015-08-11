(function() {
    'use strict';
    var module = angular.module('app.invoice.sent-owner', []);

    module.controller('InvoiceSentOwnerCtrl', ['$scope', '$modal', function($scope) {
        var $parent = $scope.$parent;
        $scope.invoice = angular.copy($parent.invoice);

        $scope.openCancelDialog = function() {
            $parent.showCancel();
        };
    }]);
})();
