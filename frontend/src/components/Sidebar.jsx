import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, LayoutDashboard, User, ListOrdered } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Orders', path: '/orders', icon: ListOrdered },
    { name: 'Customers', path: '/customers', icon: User },
  ];

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-64 glass-panel border-r border-slate-200 p-6 flex flex-col z-20 sticky top-0 h-screen"
    >
      <div className="text-2xl font-bold mb-10 text-slate-800 flex items-center gap-3">
        <ShoppingCart size={28} className="text-blue-600" />
        KiranaSync
      </div>
      
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500 text-center shadow-sm">
        <p className="font-medium text-slate-700">WhatsApp Bot</p>
        <p className="text-emerald-600 font-semibold flex items-center justify-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Online
        </p>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
