(function() {
    'use strict';
    var module = angular.module('app.invoice.done', []);

    module.controller('InvoiceDoneCtrl', ['$scope',
        function($scope) {
            var $parent = $scope.$parent;
            $scope.invoice = angular.copy($parent.invoice);
        }]);
})();
