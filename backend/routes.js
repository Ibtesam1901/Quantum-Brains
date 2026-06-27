const express = require('express');
const router = express.Router();
const whatsappController = require('./controllers/whatsappController');
const orderController = require('./controllers/orderController');

// WhatsApp Webhook
router.post('/whatsapp', whatsappController.handleIncomingMessage);

// Dashboard APIs
router.get('/orders', orderController.getOrders);
router.put('/orders/:id/status', orderController.updateOrderStatus);

module.exports = router;
