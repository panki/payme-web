var express = require('express');
var router = express.Router();
var config = require('./config')

router.get('/emails/view/:email_id', function (req, res, next) {
    var email_id = req.params.email_id;
    req.client.emails.get(email_id).then(function (email) {
        return res.render('../../mailer/templates/'+email.template+'/html', { email: email, config: config });    
    }).catch(function(error) {next(error)});
});

module.exports = router;
