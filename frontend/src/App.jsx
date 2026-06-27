import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Customers from './pages/Customers';

// Placeholder components for future pages
const PlaceholderPage = ({ title }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
    className="flex-1 flex flex-col items-center justify-center p-8 text-center"
  >
    <div className="w-24 h-24 mb-6 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
      <span className="text-4xl">🚧</span>
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">{title} Page</h2>
    <p className="text-slate-500 max-w-md">This page is under construction. It will be built out in the next phase of development.</p>
  </motion.div>
);

const App = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900 font-sans">
      <Sidebar />
      
      <main className="flex-1 h-screen overflow-y-auto custom-scrollbar z-10 relative">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;