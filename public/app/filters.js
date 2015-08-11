(function() {
    'use strict';

    angular.module('app.filters', [])
    .filter('card_number', function() {
        return function (cardNumber) {
            if (!cardNumber) { cardNumber = ''; }
            if (cardNumber.length < 16) { cardNumber += '________________'.substring(0, 16-cardNumber.length); }
            return cardNumber.match(/.{1,4}/g).join(' ');
        };
    });
}());