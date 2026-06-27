const twilio = require('twilio');
const Order = require('../models/Order');

const handleIncomingMessage = async (req, res) => {
    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();

    try {
        const incomingMsg = req.body.Body || '';
        const from = req.body.From || '';

        // Robust against empty strings
        if (!incomingMsg.trim() || !from.trim()) {
            twiml.message('We could not understand your order. Please send a valid list.');
            return res.type('text/xml').send(twiml.toString());
        }

        // Immediately create and save new Order document using simplified schema
        const newOrder = new Order({
            customerPhone: from,
            rawOrderText: incomingMsg.trim(),
            status: "Pending"
        });

        await newOrder.save();

        // Send automated simple text reply
        twiml.message("Order received! The store is reviewing your list.");
        res.type('text/xml').send(twiml.toString());

    } catch (error) {
        console.error('Error handling incoming WhatsApp message:', error);
        twiml.message("Sorry, there was an issue processing your order. Please try again later.");
        res.type('text/xml').send(twiml.toString());
    }
};

module.exports = {
    handleIncomingMessage
};
// This handles the webhook verification (GET request)
exports.verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // This matches the token you put in your .env file
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
};