function Invoices(client) {

    this.client = client;
    this.config = client.config;

    this.create = function (newForm) {
        return this.client.post('/invoices/new', {
            owner_email: newForm.owner_email,
            payer_email: newForm.payer_email,
            amount: newForm.amount
        })
    };

}

module.exports = Invoices;