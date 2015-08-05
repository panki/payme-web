var emails_events = require('../payme/emails/events');
var emails_sender = require('../payme/emails/sender');

emails_events.startEventHandler();
emails_sender.startSender();