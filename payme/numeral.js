var numeral = require('numeral');

numeral.language('ru', {
    delimiters: {
        thousands: ' ',
        decimal: '.'
    },
    abbreviations: {
        thousand: 'тыс',
        million: 'млн',
        billion: 'млрд',
        trillion: 'трлн'
    },
    currency: {
        symbol: '₽'
    }
});

numeral.language('ru');

module.exports = numeral;