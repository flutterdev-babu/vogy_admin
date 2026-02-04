'use client';

import { useState, useEffect } from 'react';
import { USER_KEYS } from '@/lib/api';
import { MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AgentDashboard() {
  const [agent, setAgent] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEYS.agent);
    if (stored) {
      setAgent(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#E32222] to-purple-800 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {agent?.name || 'Agent'}! 👋
        </h1>
        <p className="text-white/80">
          Here's what's happening in your city today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Rides" 
          value="12" 
          icon={<MapPin className="text-blue-500" />} 
          trend="+2 from yesterday"
        />
        <StatCard 
          title="Completed Today" 
          value="45" 
          icon={<CheckCircle className="text-green-500" />} 
          trend="+15% vs last week"
        />
        <StatCard 
          title="Pending Requests" 
          value="5" 
          icon={<Clock className="text-orange-500" />} 
          trend="Urgent attention needed"
        />
        <StatCard 
          title="Issues Reported" 
          value="0" 
          icon={<AlertCircle className="text-red-500" />} 
          trend="All systems normal"
        />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
        <div className="flex items-center justify-center h-40 text-gray-400">
          No recent activity to show properly yet.
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-400 font-medium">{trend}</p>
    </motion.div>
  );
}
