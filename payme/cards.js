module.exports = {
    cardType: function (cardNumber) {
        if (cardNumber.match(/^4/)) {
            return 'VISA';
        } else if (cardNumber.match(/^5[1-5]/)) {
            return 'MASTERCARD';
        } else if (cardNumber.match(/^3[47]/)) {
            return 'AMERICAN-EXPRESS';
        } else if (cardNumber.match(/^6(?:011|5)/)) {
            return 'DISCOVER';
        } else if (cardNumber.match(/^(?:2131|1800|35)/)) {
            return 'JCB';
        } else if (cardNumber.match(/^3(?:0[0-5]|[68])/)) {
            return 'DINERS-CLUB';
        } else if (cardNumber.match(/^5018|5020|5038|5893|6304|67(59|61|62|63)|0604/)) {
            return 'MAESTRO';
        } else {
            return '';
        }
    },
    
    maskCardNumber: function (cardNumber) {
        return cardNumber.slice(0, 4) + ' **** **** ' + cardNumber.slice(-4);
    }
};