var PDFDocument = require('pdfkit');
var moment = require('moment');
require('moment/locale/ru');
var accounting = require('accounting');
var config = require('../config');

accounting.settings = {
    currency: {
		symbol : "руб.",   // default currency symbol is '$'
		format: "%v %s", // controls output: %s = symbol, %v = value/number (can be object: see below)
		decimal : ",",  // decimal point separator
		thousand: " ",  // thousands separator
		precision : 2   // decimal places
	},
    number: {
		precision : 0,  // default precision on numbers is 0
		thousand: " ",
		decimal : ","
	}
};


function generateReceipt(invoice) {
    var doc = new PDFDocument();

    var headerColor = '#1B4577';
    var subHeaderColor = '#1B4577';
    var textColor = '#666666';
    var separatorColor = '#cccccc';
    var dateFormat = 'LLL';
    
    var headerFontSize = 18;
    var subHeaderFontSize = 12;
    var textFontSize = 12;
    
    var docWidth = 610;
    var headerYOffset = 80;
    var blankHeight = 30;
    var textWidth = 300;
    var textLineHeight = 30;
    
    doc.registerFont('header', 'web/receipts/fonts/Lato-Medium.ttf', 'Lato-Medium');
    doc.registerFont('text', 'web/receipts/fonts/Lato-Light.ttf', 'Lato-Light');
    
    // Place logo
    doc.image('web/receipts/images/payme_logo_blue.png', 10, 10, {scale: 0.25});
    
    // Header
    doc.font('header').fillColor(headerColor).fontSize(headerFontSize);
    doc.text('Квитанция об оплате счета\n№ '+ invoice.id, 0, headerYOffset, {width: docWidth, align: 'center'});

    // Sub header
    doc.fillColor(subHeaderColor).fontSize(subHeaderFontSize);
    doc.text('\nПри возникновении проблем, сообщите номер квитанции\nсотруднику службы поддержки:', {width: docWidth, align: 'center'});
    doc.text('\nпо телефону ' + config.contacts.support.phone + ' или по электронной почте ' + config.contacts.support.email, {width: docWidth, align: 'center'});
    
    // Separator
    doc.strokeColor(separatorColor).moveTo(5, doc.y + blankHeight).lineTo(604, doc.y + blankHeight).dash(3, {space: 2}).stroke();
    
    var lines = [];
    
    lines.push(['Получатель', invoice.owner.email]);
    if (invoice.owner_card.masked_number)
        lines.push(['Номер карты получателя', invoice.owner_card.masked_number]);
    
    lines.push(['Плательщик', invoice.payer.email]);
    if (invoice.transaction.card.masked_number) 
        lines.push(['Номер карты плательщика', invoice.transaction.card.masked_number]);

    
    lines.push(['Дата создания счета', moment(invoice.created_at).format(dateFormat, 'ru')]);
    lines.push(['Дата оплаты', moment(invoice.transaction.completed_at).format(dateFormat, 'ru')]);
    lines.push(['Сумма', accounting.formatMoney(invoice.amount)]);
    
    if (invoice.transaction.card.masked_number) {
        lines.push(['Комиссия', accounting.formatMoney(invoice.transaction.fee)]);
        lines.push(['Сумма с комиссией', accounting.formatMoney(invoice.amount + invoice.transaction.fee)]);
    }
    
    lines.push(['Статус', 'ОПЛАЧЕН']);
    
    var yOffset = doc.y + blankHeight * 2;
    var xOffset = (docWidth - textWidth) / 2;
    doc.fontSize(textFontSize).fillColor(textColor).font('text');
    
    lines.forEach(function(line) {
        doc.text(line[0] + ':', xOffset, yOffset);
        doc.text(line[1], xOffset, yOffset, {width: textWidth, align: 'right'});
        yOffset += textLineHeight;
    });
    
    // Document meta info
    doc.info.Title = 'Квитанция об оплате счета';
    doc.info.Subject = 'Счет № ' + invoice.id;
    doc.info.Author = doc.info.Producer = doc.info.Creator = 'payme4.ru';
    
    return doc;
}

module.exports = {
    generateReceipt: generateReceipt
};