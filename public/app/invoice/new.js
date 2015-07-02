(function() {
    'use strict';
    var module = angular.module('app.invoice.new', []);
    
    module.controller('InvoiceNewCtrl', ['$scope', function($scope) {
        $scope.title = 'New controller';
    }]);
})();
