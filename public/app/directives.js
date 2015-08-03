(function() {
    'use strict';

    angular.module('app.directives', []).
        directive('onlyDigits', function() {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function(scope, element, attrs, ngModel) {
                    if (!ngModel) {
                        return;
                    }
                    ngModel.$parsers.unshift(function(inputValue) {
                        var digits = inputValue.split('').filter(function(s) {
                            return (!isNaN(s) && s !== ' ');
                        }).join('');
                        ngModel.$viewValue = digits;
                        ngModel.$render();
                        return digits;
                    });
                }
            };
        })
        .directive('jmask', function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    if (attrs.mask) {
                        element.mask(attrs.mask, {placeholder: attrs.placeholder});
                    }
                }
            };
        })
        .directive('zeroInput', ["$parse", function($parse) {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function(scope, element, attrs, ngModel) {
                    scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                        if (newValue == undefined) {
                            $parse(attrs.ngModel).assign(scope, 0);
                        }
                        if (oldValue == 0 && newValue != undefined) {
                            $parse(attrs.ngModel).assign(scope, parseInt(newValue, 10));
                        }
                    }, true);
                }
            }
        }]);
}());
