var moment = require('moment-timezone');
module.exports = function(date) {
    return moment(date).tz("Europe/Moscow").locale('ru');
};