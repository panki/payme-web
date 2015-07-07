var express = require('express');
var router = express.Router();

var index_handler = function (req, res, next) {
    res.render('index')
};

router.get('/', index_handler);
router.get('/howto', index_handler);
router.get('/advantages', index_handler);
router.get('/support', index_handler);

module.exports = router;
