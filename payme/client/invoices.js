function Invoices(client) {

    this.client = client;
    this.config = client.config;
    
    this.get = function (invoice_id) {
        return this.client.get('/invoices/' + invoice_id);
    };
    
    this.create = function (newForm) {
        return this.client.post('/invoices/new', {
            owner_email: newForm.owner_email,
            payer_email: newForm.payer_email,
            amount: newForm.amount
        })
    };
    
    this.createFromEmail = function (newForm) {
        return this.client.post('/invoices/new_from_email', {
            owner_email: newForm.owner_email,
            payer_email: newForm.payer_email,
            amount: newForm.amount
        })
    };

}

module.exports = Invoices;