var emails_events = require('../payme/emails/events');
var emails_sender = require('../payme/emails/sender');
var emails_inbound = require('../payme/emails/inbound');

emails_events.startEventHandler();
emails_inbound.startEventHandler();
emails_sender.startSender();