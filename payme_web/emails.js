var express = require('express');
var router = express.Router();
var config = require('./config');

router.get('/emails/:email_id', function (req, res, next) {
    var email_id = req.params.email_id;
    req.client.emails.get(email_id).then(function (email) {
        return res.render(email.template+'/html', { email: email, config: config, web: true });    
    }).catch(function(error) {next(error)});
});

module.exports = router;
