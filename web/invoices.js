var express = require('express');
var router = express.Router();

router.get('/invoices/new', function(req, res, next) {
    res.render('invoices/new');
});

module.exports = router;