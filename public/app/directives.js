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
                link: function(scope, elem, attr) {
                    if (attr.mask) {
                        elem.mask(attr.mask, {placeholder: attr.placeholder});
                    }
                }
            };
        });
}());
