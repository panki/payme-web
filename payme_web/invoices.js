var Promise = require('bluebird');
var express = require('express');
var router = express.Router();
var receipts = require('../payme/receipts');


// Invoice session middleware.
function authMiddleware(cookie_url_prefix, req, res, next) {
    var invoiceId = req.params.invoice_id;

    Promise.resolve(req.cookies.invoice_session).then(function(session_id) {
        // Authorize a session cookie.
        if (!session_id) {
            return null;
        }

        return req.client.auth.authorize_session(session_id).catch(function(error) {
            return null;
        });

        // Fallback to an auth token.   
    }).then(function(session) {
        if (session) {
            return session;
        }

        if (!req.query.token) {
            return null;
        }

        return req.client.auth.authorize_token(req.query.token).then(function(session) {
            // Set a session cookie for the current invoice.

            res.cookie('invoice_session', session.id, {
                path: '/invoice/' + cookie_url_prefix + '/' + invoiceId,
                httpOnly: true
            });
            return session;
        });

        // Update the response locals.
    }).then(function(session) {
        if (!session) {
            var error = new Error(
                'Ошибка авторизации, попробуйте перейти по ссылке счета из еще раз.');
            error.code = 'unauthorized';
            throw error;
        }

        req.client.setSessionId(session.id);
        res.locals.session = session;
        res.locals.session_json = JSON.stringify({
            id: session.id,
            account_id: session.account_id
        });
        next();

    }).catch(function(error) {
        next(error);
    });
}

function renderInvoice(req, res, next) {
    res.render('invoice/main', req.params);
}

router.use('/invoice/:direction(outgoing|incoming)/:invoice_id', function(req, res, next) {
    return authMiddleware(req.params.direction, req, res, next);
});

router.use('/invoice/:direction(outgoing|incoming)/:invoice_id/*', function(req, res, next) {
    if (res.locals.session) { return next(); }
    return authMiddleware(req.params.direction, req, res, next);
});

router.get('/invoice/:direction(outgoing|incoming)/:invoice_id/receipt.pdf', function(req, res, next) {
    req.client.invoices.get(req.params.invoice_id).then(function(invoice) {
        if (invoice.state != 'paid') {
            var err = new Error('Счет еще не оплачен');
            err.code = 'invalid';
            return next(err);
        }
        var doc = receipts.generateReceipt(invoice);
        var disposition = 'download' in req.query ? 'attachment; filename=receipt-' + invoice.number + '.pdf' : 'inline';
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': disposition
        });
        doc.pipe(res);
        doc.end();
    }).catch(function(err) {
        next(err);
    });
});

router.get('/invoice/:direction(outgoing|incoming)/:invoice_id', renderInvoice);
router.get('/invoice/:direction(outgoing|incoming)/:invoice_id/*', renderInvoice);


router.post('/transaction/confirmed/:invoice_id/', function(req, res, next) {
    req.client.alfabank.confirm_transaction(req.body.PaRes, req.body.MD).then(function(result) {
        res.redirect('/invoice/incoming/' + req.params.invoice_id + '/');
    }).catch(function(error) {
        var locals = {error: error, invoiceId: req.params.invoice_id};
        res.render('invoice/transaction_error', locals);
    });
});

router.get('/transaction/error/:invoice_id/', function(req, res, next) {
    var locals = {error: {message: 'error'}, invoiceId: req.params.invoice_id};
    res.render('invoice/transaction_error', locals);
});

router.get('/invoice/created', function(req, res, next) {
    res.render('invoice/created');
});

module.exports = router;
