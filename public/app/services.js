(function() {
    'use strict';

    angular.module('app.services', [])
    .factory('cardTypeDetector', function() {
        return function (cardNumber) {
            if (cardNumber.match(/^4/)) {
                return 'visa';
            } else if (cardNumber.match(/^5[1-5]/)) {
                return 'mastercard';
            } else if (cardNumber.match(/^3[47]/)) {
                return 'american-express';
            } else if (cardNumber.match(/^6(?:011|5)/)) {
                return 'discover';
            } else if (cardNumber.match(/^(?:2131|1800|35)/)) {
                return 'jcb';
            } else if (cardNumber.match(/^3(?:0[0-5]|[68])/)) {
                return 'diners-club';
            } else if (cardNumber.match(/^5018|5020|5038|5893|6304|67(59|61|62|63)|0604/)) {
                return 'maestro';
            } else {
                return '';
            }
        }
    });
}());