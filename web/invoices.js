var express = require('express');
var router = express.Router();


router.get('/invoice_new', function(req, res, next) {
    res.render('invoice_new');
});


router.get('/invoice/:invoice_id/*', function(req, res, next) {
    var locals = {
        'invoice_id': req.params.invoice_id
    };
    
    if (req.query.auth_token) {
        req.client.tokens.authorize(req.query.auth_token).then(function (session) {
            locals.session_id = session.id;
            res.render('invoice', locals);
        }).catch(function (e) { next(e) })
    } else {
        res.render('invoice', locals);    
    }
});


module.exports = router;
