var express = require('express');
var router = express.Router();


router.get('/invoice_new', function(req, res, next) {
    res.render('invoice_new');
});


router.get('/invoice/:invoice_id', function(req, res, next) {
    res.render('invoice', req.params);
});


router.get('/invoice/:invoice_id/*', function(req, res, next) {
    res.render('invoice', req.params);
});


module.exports = router;
