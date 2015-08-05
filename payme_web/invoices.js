var express = require('express');
var router = express.Router();
var receipts = require('../payme/receipts');


router.get('/invoice/:invoice_id', function(req, res, next) {
    res.render('invoice', req.params);
});


router.get('/invoice/:invoice_id/receipt.pdf', function(req, res, next) {
    req.client.invoices.get(req.params.invoice_id).then(function(invoice) {
        if (invoice.state != 'paid') {
            var err = new Error('Счет еще не оплачен');
            err.code = 'invalid';
            return next(err);
        }
        var doc = receipts.generateReceipt(invoice);
        var disposition = 'download' in req.query ? 'attachment; filename=receipt.pdf' : 'inline';
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


router.get('/invoice/:invoice_id/*', function(req, res, next) {
    res.render('invoice', req.params);
});


router.post('/transaction/confirmed/', function(req, res, next) {
    req.client.alfabank.confirm_transaction(req.body.PaRes, req.body.MD).then(function (result) {
        res.render('success');
    }).catch(function (error) {
        res.render('error', {error: error});
    })
});


module.exports = router;
