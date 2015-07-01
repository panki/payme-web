'use strict';

module.exports = function(app) {

    app.all('*', function(req, res, next) {
        var err = new Error();
        err.status = 404;
        next(err);
    });

    app.use(function(error, req, res, next) {
        var ajax = req.xhr;
        
        switch (error.status) {
            case 401:
                console.log('Unauthorized error: ' + req.uri);
                if (ajax) {
                    res.send({status: 401, error: 'Доступ запрещен'});
                } else {
                    res.redirect('/');
                }
                break;
            case 404:
                if (ajax) {
                    res.send({status: 404, error: 'Страница не найдена'});
                } else {
                    res.status(404);
                    res.render('error', {error_code: '404', error_name: 'Страница не найдена'});
                }
                break;
            case 422:
                if (ajax) {
                    res.send({status: 422, error: error.error});
                } else {
                    res.status(422);
                    res.render('error', {error_code: '422', error_name: error.error});
                }
                break;
            default:
                console.error(error.stack);
                if (ajax) {
                    res.send({status: 500, error: 'Произошла ошибка'});
                } else {
                    res.status(500);
                    res.render('error', {error_code: '500', error_name: 'Произошла ошибка'});
                }
                break;
        }
    });
};