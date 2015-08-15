(function() {
    'use strict';
    var module = angular.module('app.invoice.sent-owner', []);
    
    function endsWith(s, suffix) {
        return s.indexOf(suffix, s.length - suffix.length) !== -1;
    }
    
    module.controller('InvoiceSentOwnerCtrl', ['$scope', '$location', function($scope, $location) {
        var $parent = $scope.$parent;
        $scope.invoice = angular.copy($parent.invoice);

        $scope.cancel = function() {
            $parent.showCancel();
        };
        
        // Handle cancel links.
        {
            var path = $location.path();
            var cancel = false;
            var newPath = null;
            
            if (endsWith(path, '/cancel')) {
                cancel = true;
                newPath = path.substring(0, path.length - '/cancel'.length);
            } else if (endsWith(path, '/cancel/')) {
                cancel = true;
                newPath = path.substring(0, path.length - '/cancel/'.length);
            }

            if (cancel) {
                $location.path(newPath);
                $scope.cancel();
            }
        }
    }]);
})();
