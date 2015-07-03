(function() {
    'use strict';

    var module = angular.module('app.invoice', [
        'ngRoute',
        'app.invoice.pay',
        'app.invoice.show']);

    module.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/invoice/:invoice_id', {
                templateUrl: '/public/build/app/invoice/show.html'
            })
            .when('/invoice/:invoice_id/send', {
                templateUrl: '/public/build/app/invoice/send.html'
            })
            .when('/invoice/:invoice_id/pay', {
                templateUrl: '/public/build/app/invoice/pay.html'
            });
    }]);
    
    module.controller('InvoiceCtrl', ['$scope', 'Client', function($scope, client) {
        // Should be called from ng-init
        $scope.setSession = function (session) {
            $scope.session = session;
            client.sessionId = session.id;
        }
    }]);
})();
