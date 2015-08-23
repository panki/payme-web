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
                            var value = parseInt(newValue, 10);
                            $parse(attrs.ngModel).assign(scope, value);
                        }
                    }, true);
                }
            };
        }])
        .directive('invoiceAmount', ["$parse", 'config', function($parse, config) {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function(scope, element, attrs) {
                    $(element).blur(function() {
                        var value = parseInt($(this).val(), 10);
                        if (value < config.invoices.minAmount) { value = config.invoices.minAmount }
                        if (value > config.invoices.maxAmount) { value = config.invoices.maxAmount }
                        $parse(attrs.ngModel).assign(scope, value);
                        scope.$apply();
                    });
                }
            };
        }])
        .directive('autosizeinput', ['$window', function ($window) {
            return {
                restrict: 'A',
                scope: { model: '=ngModel' },
                link: function (scope, element, attr) {
                    if (element.prop('tagName') !== 'INPUT') {
                        return;
                    }
        
                    var minWidth = parseInt(element.css('minWidth') || '0');
                    var sizeDelta = parseInt(attr.sizeDelta || '2');
        
                    var sizer = angular.element('<div style="position: absolute; visibility: hidden; height: 0; width: 0; overflow: scroll; white-space: nowrap;"></div>');
                    element.parent().append(sizer);
                    
                    function updateStyle() {
                        var inputStyle = window.getComputedStyle(element[0]);
                        angular.forEach([
                            'fontFamily',
                            'fontSize',
                            'fontWeight',
                            'fontStyle',
                            'letterSpacing',
                            'textTransform',
                            'wordSpacing',
                            'textIndent',
                            'boxSizing',
                            'borderRightWidth',
                            'borderLeftWidth',
                            'borderLeftStyle',
                            'borderRightStyle',
                            'paddingLeft',
                            'paddingRight',
                            'marginLeft',
                            'marginRight'
                        ], function (value) {
                            sizer.css(value, inputStyle[value]);
                        });    
                    }
        
                    function update() {
                        sizer.html(element.val() || element.prop('placeholder'));
                        var newWidth = Math.max(minWidth, sizer.prop('scrollWidth') + sizeDelta);
                        element.css('width', newWidth + 'px');
                    }
        
                    update();
                    updateStyle();
                    
                    scope.$watch('model', update);
                    element.on('keydown keyup focus input propertychange change', update);
                    
                    angular.element($window).bind('resize', function() {
                        updateStyle();
                        update();
                    });
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
                templateUrl: '/public/build/templates/widgets/credit_card.html'
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
                templateUrl: '/public/build/templates/widgets/credit_card.html'
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
        })
        .directive('email', function () {
            var isValidEmail = function(value) {
                return value && !value.match(/[\@\.\-\_]{2,}/) &&
                    (
                        value.match(/^[a-zA-Z0-9\.\-\_]{2,}@[a-zA-Z0-9\.\-]{2,}\.\w{2,}$/) ||
                        value.match(/^[a-zA-Z0-9\.\-\_]{2,}@[АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0-9\.\-]{2,}\.рф$/)
                    ) ? true : false;
            };
            return {
                require: 'ngModel',
                link: function(scope, elem, attr, ngModel) {
                    ngModel.$parsers.unshift(function(value) {
                        var valid = value ? isValidEmail(value.replace(/^\s+/, '').replace(/\s+$/, '')) : false;
                        ngModel.$setValidity('email', valid);
                        return value;
                    });

                    ngModel.$formatters.unshift(function(value) {
                        ngModel.$setValidity('email', isValidEmail(value));
                        return value;
                    });
                }
            };
        })

        .directive('slideToAnchor', function() {
            return {
                restrict: 'A',
                require: "?href",
                link: function(scope, elem, attr, ngModel) {
                    $(elem).on('click', function(e) {
                        e.preventDefault();

                        var target = $(attr.href);
                        if (target.length==0) {
                            return;
                        }
                        $('html, body').stop().animate({
                            'scrollTop': target.offset().top
                        }, 300, 'swing');
                    });
                }
            };
        });
}());
