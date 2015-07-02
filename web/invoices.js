var express = require('express');
var router = express.Router();

router.get('/invoices/new', function(req, res, next) {
    res.render('invoice-new');
});


router.get('/invoices/*', function(req, res, next) {
    res.render('invoice');
});


module.exports = router;
