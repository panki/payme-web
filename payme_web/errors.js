'use strict';
var raven = require('raven');
var config = require('./config');


module.exports = function(app) {
    if (config.sentry && config.sentry.dns) {
        console.log('Sentry enabled, dns=' + config.sentry.dns);
        app.use(raven.middleware.express(config.sentry.dns));
    }

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        if (err.status == 404) {
            res.status(404);
            res.render('error', {error: {message: 'Страница не найдена'}})
            return;
        }
        
        switch (err.code) {
            case 'invalid':
                res.status(422);
                res.render('error', {error: err});
                break;
            default:
                console.error(err.stack);
                res.status(500);
                res.render('error', {error: {message: 'Внутрення ошибка сервера'}});
        }
    });
};
