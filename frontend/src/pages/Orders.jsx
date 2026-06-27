import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import KanbanBoard from '../components/KanbanBoard';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      // The API returns pagination data: { success: true, data: orders, pagination: {...} }
      const response = await axios.get('http://localhost:5000/api/orders?limit=100');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000); // Fast polling for real-time feel
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      // Optimistic UI update
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status });
      // We don't necessarily need to refetch immediately because we did an optimistic update,
      // but it will automatically sync on the next polling cycle.
    } catch (error) {
      console.error('Error updating order:', error);
      fetchOrders(); // Revert on failure
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 pb-20 w-full h-full flex flex-col"
    >
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold mb-2 neon-text text-white">Live Orders</h1>
          <p className="text-slate-400">Drag or click to move orders through your pipeline.</p>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Sync Active
        </div>
      </header>

      <KanbanBoard orders={orders} onUpdateStatus={updateOrderStatus} />
    </motion.div>
  );
};

export default Orders;
