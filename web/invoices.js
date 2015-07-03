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

router.post('/transaction/confirmed/', function(req, res, next) {
    req.client.alfabank.confirm_transaction(req.body.PaRes, req.body.MD).then(function (result) {
        res.render('success');
    }).catch(function (error) {
        res.render('error', {error: error});
    })
});


module.exports = router;
