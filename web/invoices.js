var express = require('express');
var router = express.Router();


router.get('/invoice/:invoice_id/*', function(req, res, next) {
    res.render('invoice', req.params);
});


router.get('/invoices*', function(req, res, next) {
    res.render('invoice');
});

module.exports = router;
