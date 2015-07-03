(function() {
    'use strict';
    var module = angular.module('app.invoice.pay', []);
    
    module.controller('InvoicePayCtrl', ['$scope', '$routeParams', 'Client', function($scope, $routeParams, client) {
        // session comes from ng-init
        $scope.title = 'Pay controller';
        $scope.invoice_id = $routeParams.invoice_id;
        $scope.card = { 'sender_card_number': '1234567890123456', 'sender_card_exp_year': 2015, 'sender_card_exp_month': '06', 'sender_card_cvv': 765};
        $scope.form_error = '123';
        
        $scope.submit = function() {
            $scope.form_error = '345';
            if ($scope.form.$valid) {
                client.invoices.pay($scope.invoice_id, $scope.session, $scope.card)
                    .then(function (confirm_3ds) {
                        $scope.form_error = confirm_3ds;     
                    })
                    .catch(function (error) {
                        $scope.form_error = error.message; 
                        console.log($scope.form_error);
                    });
            }
        }
    }]);
})();
