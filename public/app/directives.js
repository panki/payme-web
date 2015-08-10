(function() {
    'use strict';

    angular.module('app.directives', ['credit-cards']).
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
            var expr = new RegExp("^[0-9,]*$");
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function(scope, element, attrs, ngModel) {
                    scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                        if (newValue !== undefined && !expr.test(newValue)) {
                            $parse(attrs.ngModel).assign(scope, oldValue);
                            return;
                        }
                        if (newValue === undefined) {
                            $parse(attrs.ngModel).assign(scope, 0);
                        }
                        if (oldValue === 0 && newValue !== undefined) {
                            $parse(attrs.ngModel).assign(scope, parseInt(newValue, 10));
                        }
                    }, true);
                }
            };
        }])
        .directive('cardWidget', ['Client', 'cardTypeDetector', 'creditcards', function(client, cardTypeDetector, creditcards) {
            return {
                restrict: 'E',
                scope: {
                    cardNumber: '=',
                    cardNumberDisplay: '=',
                    cardType: '=',
                    cardBank: '='
                },
                link: function(scope, element, attrs) {
                    var defaultBank = {
                        color: '#123A69',
                        name: 'ВАШ БАНК',
                        country: 'RU',
                        icon: ''
                    };
                    
                    function detectCardType(cardNumber) {
                        scope.cardType = cardTypeDetector(cardNumber);
                    }
                    
                    function lookupBank(cardNumber) {
                        if (cardNumber.length >= 6) {
                            var bin = cardNumber.substring(0,6);
                            if (scope.currentBin != bin) {
                                scope.currentBin = bin;
                                client.banks.lookup(bin).then(function(bank) {
                                    scope.cardBank = bank.id ? bank : defaultBank;
                                }).catch(function(err) {
                                    scope.cardBank = defaultBank;
                                });
                            }
                        } else scope.cardBank = defaultBank;
                    }
                    
                    function cardNumberUpdated(value) {
                        scope.cardNumber = creditcards.card.parse(value);
                        scope.cardNumberDisplay = creditcards.card.format(scope.cardNumber);
                        detectCardType(scope.cardNumber);
                        lookupBank(scope.cardNumber);
                    }
                    
                    $(attrs.cardNumberInput)
                    .keyup(function() {
                        cardNumberUpdated($(this).val());
                        scope.$apply();
                    })
                    .blur(function() {
                        cardNumberUpdated($(this).val());
                        scope.$apply();
                    });
                    
                    cardNumberUpdated(angular.element(attrs.cardNumberInput).data('$ngModelController').$modelValue);
                },
                templateUrl: 'public/build/templates/widgets/credit_card.html'
            }
        }]);
}());
