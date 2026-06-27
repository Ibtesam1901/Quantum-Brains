import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingBag, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card p-6 flex items-start justify-between group"
  >
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform duration-300 border border-${color}-100`}>
      <Icon size={24} />
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/orders/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Format data for chart
  const chartData = stats?.weeklyRevenue?.map(item => ({
    name: new Date(item._id).toLocaleDateString('en-IN', { weekday: 'short' }),
    Revenue: item.revenue
  })) || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 pb-20 w-full"
    >
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-2 text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500">Track your WhatsApp store performance in real-time.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Today's Revenue" 
          value={`₹${(stats?.todayRevenue || 0).toLocaleString('en-IN')}`} 
          icon={TrendingUp} 
          color="emerald" 
          delay={0.1} 
        />
        <StatCard 
          title="Today's Orders" 
          value={stats?.todayOrders || 0} 
          icon={ShoppingBag} 
          color="blue" 
          delay={0.2} 
        />
        <StatCard 
          title="Pending Orders" 
          value={stats?.pendingOrders || 0} 
          icon={Clock} 
          color="amber" 
          delay={0.3} 
        />
        <StatCard 
          title="Total Customers" 
          value={stats?.totalCustomers || 0} 
          icon={Users} 
          color="indigo" 
          delay={0.4} 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card p-6 h-[400px]"
      >
        <h3 className="text-xl font-semibold mb-6 text-slate-800">Revenue (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={value => `₹${value}`} />
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: '#2563eb', fontWeight: 'bold' }}
              formatter={(value) => [`₹${value}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="Revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
