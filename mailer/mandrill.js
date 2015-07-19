module.exports = {
    makeHeaders: function(email) {
        return {
            'X-MC-Tags': _makeTags(email),
            'X-MC-Track': 'opens',
            'X-MC-Metadata': '{ "email_id": "' + email.id + '" }'
        }
    }
};

function _makeTags(email) {
    return email.type;
}

