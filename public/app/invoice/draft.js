(function() {
    'use strict';
    var module = angular.module('app.invoice.draft', []);

    module.controller('InvoiceDraftCtrl', ['$scope',
        function($scope) {
            var $parent = $scope.$parent;
            
            $scope.invoice = angular.copy($parent.invoice);
            $scope.submitting = false;
            
            $scope.formData = {
                expire_at: moment().add(7, 'days').format('YYYY-MM-DD'),
                amount: $scope.invoice.amount
            };
            
            $scope.toggleAdvancedForm = function() {
                $('#slide1').toggleClass('offcanvas');
                $('#slide3').toggleClass('offcanvas');
                $('#edit_card').toggleClass('hide');
            };
            
            $scope.submit = function(valid) {
                if (!valid) {
                    console.log('Submit aborted, not valid');
                    return;
                }
                if ($scope.submitting) {
                    console.log('Submit aborted, already submitting');
                    return;
                }
                
                var formData = angular.copy($scope.formData);
                formData.owner_card_number = formData.owner_card_number.replace(/ /g, '') ;
                console.log('Submitting ', formData);
                $scope.submitting = true;
                
                $parent.sendInvoice(formData).then(function() {
                    $parent.sendSuccess();
                }).catch(function(error) {
                    $parent.onError(error);
                }).finally(function() {
                    $scope.submitting = false;
                });
            };
            
            $scope.showInvoice = function() {
                $scope.reloadChild();
            };
        }]);
})();
