'use client';

import { useState, useEffect } from 'react';
import { USER_KEYS } from '@/lib/api';
import { MapPin, Clock, Users, TrendingUp, DollarSign } from 'lucide-react';
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
      <div className="bg-gradient-to-r from-[#E32222] to-purple-800 rounded-3xl p-8 text-white shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {agent?.name || 'Agent'}! 👋
          </h1>
          <p className="text-white/80">
            You are our Brand Ambassador. Spread the word and earn!
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center">
          <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Your Referral Code</p>
          <p className="text-2xl font-mono font-bold">{agent?.agentCode || 'N/A'}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Referrals" 
          value="128" 
          icon={<Users className="text-blue-500" />} 
          trend="+12 this month"
        />
        <StatCard 
          title="Conversion Rate" 
          value="15.2%" 
          icon={<TrendingUp className="text-green-500" />} 
          trend="+2.1% from last month"
        />
        <StatCard 
          title="Total Earnings" 
          value="₹12,450" 
          icon={<DollarSign className="text-yellow-500" />} 
          trend="Next payment: Feb 15"
        />
        <StatCard 
          title="Pending Rewards" 
          value="₹1,200" 
          icon={<Clock className="text-orange-500" />} 
          trend="Will be cleared soon"
        />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Referrals</h2>
        <div className="flex items-center justify-center h-40 text-gray-400">
          No recent referral activity yet.
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
