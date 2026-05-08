'use client';

import { useState, useEffect } from 'react';
import { USER_KEYS } from '@/lib/api';
import { agentService } from '@/services/agentService';
import { MapPin, Clock, Users, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AgentDashboard() {
  const [agent, setAgent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEYS.agent);
    if (stored) {
      setAgent(JSON.parse(stored));
    }

    const fetchStats = async () => {
      try {
        const response = await agentService.getAnalytics();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalReferrals = (stats?.totalVendors || 0) + (stats?.totalCorporates || 0);
  const conversionRate = stats?.totalRides > 0 
    ? ((stats.completedRides / stats.totalRides) * 100).toFixed(1) + '%' 
    : '0%';

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
          value={isLoading ? "..." : totalReferrals.toString()} 
          icon={<Users className="text-blue-500" />} 
          trend={isLoading ? "" : `${stats?.totalVendors || 0} Vendors, ${stats?.totalCorporates || 0} Corps`}
        />
        <StatCard 
          title="Conversion Rate" 
          value={isLoading ? "..." : conversionRate} 
          icon={<TrendingUp className="text-green-500" />} 
          trend={isLoading ? "" : `${stats?.completedRides || 0} / ${stats?.totalRides || 0} Rides`}
        />
        <StatCard 
          title="Total Earnings" 
          value={isLoading ? "..." : `₹${stats?.totalRevenue?.toLocaleString() || 0}`} 
          icon={<DollarSign className="text-yellow-500" />} 
          trend={isLoading ? "" : "Calculated from completed rides"}
        />
        <StatCard 
          title="Pending Rewards" 
          value="₹0" 
          icon={<Clock className="text-orange-500" />} 
          trend="No pending rewards"
        />
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Top Referrals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Top Vendors</h3>
            <div className="space-y-4">
              {stats?.topVendors?.length > 0 ? (
                stats.topVendors.map((v: any) => (
                  <div key={v.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">{v.companyName || v.name}</span>
                    <span className="text-xs bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">{v.rideCount} rides</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">No vendors yet</div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Top Corporates</h3>
            <div className="space-y-4">
              {stats?.topCorporates?.length > 0 ? (
                stats.topCorporates.map((c: any) => (
                  <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">{c.companyName}</span>
                    <span className="text-xs bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">{c.rideCount} rides</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">No corporates yet</div>
              )}
            </div>
          </div>
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
