(function() {
    'use strict';
    var module = angular.module('app.invoice.draft', ['ui.bootstrap.datepicker']);

    module.controller('InvoiceDraftCtrl', ['$scope',
        function($scope) {
            var $parent = $scope.$parent;
            
            $scope.invoice = angular.copy($parent.invoice);
            $scope.submitting = false;
            
            $scope.formData = {
                expire_at: moment().add(7, 'days').format('YYYY-MM-DD'),
                remind_daily: false,
                amount: $scope.invoice.amount
            };
            
            $scope.datepicker = {
                opened: false,
                period: 'week'
            };
            
            $scope.setCustomExpire = function () {
                $scope.datepicker.opened = true;
            };
            
            $scope.setExpireInWeek = function () {
                $scope.datepicker.period = 'week';
                $scope.formData.expire_at = moment().add(7, 'days').format('YYYY-MM-DD');
            };
            
            $scope.setExpireInMonth = function () {
                $scope.datepicker.period = 'month';
                $scope.formData.expire_at = moment().add(1, 'months').format('YYYY-MM-DD');
            };
            
            $scope.$watch('formData.expire_at', function() {
                if ($scope.formData.expire_at === moment().add(7, 'days').format('YYYY-MM-DD')) {
                    $scope.datepicker.period = 'week';    
                } else if ($scope.formData.expire_at === moment().add(1, 'months').format('YYYY-MM-DD')) {
                    $scope.datepicker.period = 'month';
                } else {
                    $scope.datepicker.period = 'custom';    
                }
            });
            
            $scope.datepickerOptions = {
                formatYear: 'yy',
                startingDay: 1,
                showWeeks: false,
                showButtonBar: false,
                minDate: moment().add(1, 'days')
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
                formData.expire_at = moment(formData.expire_at).format('YYYY-MM-DD');
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
