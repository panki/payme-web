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
                link: function(scope, element, attrs) {
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
                    cardExpDate: '=',
                    cardCvv: '=',
                    cardType: '=',
                    cardBank: '='
                },
                link: function(scope, element, attrs) {
                    var defaultBank = {
                        color: '#214b6e',
                        name: '',
                        country: 'RU',
                        icon: ''
                    };
                    
                    function detectCardType(cardNumber) {
                        scope.cardType = cardTypeDetector(cardNumber);
                    }
                    
                    function lookupBank(cardNumber) {
                        if (cardNumber.length >= 6) {
                            var bin = cardNumber.substring(0,6);
                            if (scope.currentBin !== bin) {
                                scope.currentBin = bin;
                                client.banks.lookup(bin).then(function(bank) {
                                    if (bank.id && bank.color === '#000000') {
                                        bank.color = defaultBank.color;
                                    }
                                    scope.cardBank = bank.id ? bank : defaultBank;
                                }).catch(function() {
                                    scope.cardBank = defaultBank;
                                });
                            }
                        } else { scope.cardBank = defaultBank; }
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
                    .focus(function() {
                        cardNumberUpdated($(this).val());
                        scope.$apply();
                    })
                    .blur(function() {
                        cardNumberUpdated($(this).val());
                        scope.$apply();
                    });
                    
                    function cardExpDateUpdated(value) {
                        scope.cardExpDate = value;
                    }
                    
                    function cardCvvUpdated(value) {
                        scope.cardCvv = value;
                    }
                    
                    if (attrs.cardExpDateInput) {
                        $(attrs.cardExpDateInput)
                        .keyup(function() {
                            cardExpDateUpdated($(this).val());
                            scope.$apply();
                        })
                        .focus(function() {
                            cardExpDateUpdated($(this).val());
                            scope.$apply();
                        })
                        .blur(function() {
                            cardExpDateUpdated($(this).val());
                            scope.$apply();
                        });
                        cardExpDateUpdated($(attrs.cardExpDateInput).val());
                    }
                    
                    if (attrs.cardCvvInput) {
                        $(attrs.cardCvvInput)
                        .keyup(function() {
                            cardCvvUpdated($(this).val());
                            scope.$apply();
                        })
                        .focus(function() {
                            cardCvvUpdated($(this).val());
                            $(element).find('.card').toggleClass('back');
                            scope.$apply();
                        })
                        .blur(function() {
                            cardCvvUpdated($(this).val());
                            $(element).find('.card').toggleClass('back');
                            scope.$apply();
                        });
                        cardExpDateUpdated($(attrs.cardExpDateInput).val());
                    }
                    
                    cardNumberUpdated(angular.element(attrs.cardNumberInput).data('$ngModelController').$modelValue);
                },
                templateUrl: 'public/build/templates/widgets/credit_card.html'
            };
        }])
    
        .directive('cardStatic', ['cardTypeDetector', function(cardTypeDetector) {
            return {
                restrict: 'E',
                scope: {
                    cardNumber: '=',
                    cardType: '=',
                    cardBank: '='
                },
                link: function(scope) {
                    scope.cardType = cardTypeDetector(scope.cardNumber);
                },
                templateUrl: 'public/build/templates/widgets/credit_card.html'
            };
        }])
    
        .directive('luhn', function (){ 
            var luhn = (function (array) {
                return function luhn (number) {
                    if (!number) { return false; }
                    var length = number.length;
                    if (length !== 16) { return false; }
                    var bit = 1;
                    var sum = 0;
                    var value;
                    
                    while (length) {
                        value = parseInt(number.charAt(--length), 10);
                        sum += (bit ^= 1) ? array[value] : value;
                    }
                    
                    return !!sum && sum % 10 === 0;
                };
            }([0, 2, 4, 6, 8, 1, 3, 5, 7, 9]));
            return {
                require: 'ngModel',
                link: function(scope, elem, attr, ngModel) {
                    ngModel.$parsers.unshift(function(value) {
                        var valid = value ? luhn(value.replace(/\D/g, '')) : false;
                        ngModel.$setValidity('invalid', valid);
                        return value;
                    });
                    
                    ngModel.$formatters.unshift(function(value) {
                        ngModel.$setValidity('invalid', luhn(value));
                        return value;
                    });
                }
            };
        });
}());
