var express = require('express');
var router = express.Router();

var index_handler = function (req, res, next) {
    res.render('index')
};

router.get('/', index_handler);
router.get('/faq', index_handler);
router.get('/terms', index_handler);
router.get('/tariffs', index_handler);

module.exports = router;
