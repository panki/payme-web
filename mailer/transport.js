var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var config = require('./config');
var transport = nodemailer.createTransport(smtpTransport(config.mailer.transport.smtp));

module.exports = {
    send: function(mailOptions) {
        return new Promise(function (res, rej) {
           transport.sendMail(mailOptions, function cb(err, data) {
                if(err) rej(err);
                else res(data);
            });
        });
    }
};