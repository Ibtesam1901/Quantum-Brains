import React from 'react';
import { Phone, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderCard = ({ order, onUpdateStatus }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ y: -5 }}
      className="glass-card p-5 mb-4 group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="flex justify-between items-start mb-4">
        <span className="font-bold text-slate-800 text-lg tracking-tight">#{order.orderId}</span>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1 border border-slate-200">
          <Clock size={12} />
          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <div className="flex items-center gap-2 text-slate-600 text-sm mb-4 bg-slate-50 p-2 rounded-lg border border-slate-200">
        <div className="p-1.5 bg-blue-100 rounded-md text-blue-600"><Phone size={14} /></div>
        <span className="font-medium">{order.customerPhone}</span>
      </div>
      
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
        {order.items && order.items.map((item, idx) => (
          <div key={idx} className="flex items-center text-sm mb-2 last:mb-0 text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
            <span className="flex-1 truncate font-medium">{item.name}</span>
            <span className="text-slate-600 text-xs bg-white px-1.5 py-0.5 rounded ml-2 border border-slate-200 shadow-sm">x{item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-5 font-semibold">
        <span className="text-slate-500 text-sm">Total Bill</span>
        <span className="text-emerald-600 text-lg">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
      </div>
      
      <div className="flex gap-2 mt-auto">
        {order.status === 'pending' && (
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors text-sm shadow-sm flex items-center justify-center gap-1" onClick={() => onUpdateStatus(order._id, 'confirmed')}>
            Process <ChevronRight size={16} />
          </button>
        )}
        {order.status === 'confirmed' && (
          <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-medium transition-colors text-sm shadow-sm flex items-center justify-center gap-1" onClick={() => onUpdateStatus(order._id, 'ready')}>
            Mark Ready <ChevronRight size={16} />
          </button>
        )}
        {order.status === 'ready' && (
          <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium transition-colors text-sm shadow-sm flex items-center justify-center gap-1" onClick={() => onUpdateStatus(order._id, 'delivered')}>
            <CheckCircle2 size={16} /> Complete
          </button>
        )}
      </div>
    </motion.div>
  );
};

const KanbanBoard = ({ orders, onUpdateStatus }) => {
  const columns = [
    { title: 'New Orders', status: 'pending', color: 'blue', glow: '' },
    { title: 'Processing', status: 'confirmed', color: 'amber', glow: '' },
    { title: 'Ready for Pickup', status: 'ready', color: 'emerald', glow: '' }
  ];

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 h-full min-h-[70vh]">
      {columns.map(col => {
        const columnOrders = orders.filter(o => o.status === col.status);
        return (
          <div key={col.status} className={`flex-1 min-w-[320px] max-w-[400px] glass-panel rounded-2xl flex flex-col border-t-4 border-t-${col.color}-500 ${col.glow}`}>
            <div className="p-5 flex justify-between items-center border-b border-slate-200 bg-slate-50 rounded-t-2xl">
              <h2 className="font-semibold text-lg text-slate-800">{col.title}</h2>
              <span className={`bg-${col.color}-100 text-${col.color}-700 px-3 py-1 rounded-full text-xs font-bold border border-${col.color}-200 shadow-sm`}>
                {columnOrders.length}
              </span>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
              <AnimatePresence>
                {columnOrders.map(order => (
                  <OrderCard key={order._id} order={order} onUpdateStatus={onUpdateStatus} />
                ))}
              </AnimatePresence>
              
              {columnOrders.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="h-32 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl mt-4 bg-white/50"
                >
                  <span className="text-sm font-medium">No {col.status} orders</span>
                </motion.div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
