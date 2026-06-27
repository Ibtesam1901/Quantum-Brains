const Order = require('../models/Order');

const getOrders = async (req, res) => {
    try {
        // Pull all orders where status is not "Delivered", newest first
        const orders = await Order.find({ status: { $ne: 'Delivered' } }).sort({ createdAt: -1 });
        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        // Ensure status is either Accepted or Delivered for this simple MVP
        if (status !== 'Accepted' && status !== 'Delivered') {
            return res.status(400).json({ error: 'Invalid status update.' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId, 
            { status }, 
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        res.status(200).json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getOrders,
    updateOrderStatus
};
