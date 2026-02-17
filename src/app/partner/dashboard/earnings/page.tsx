'use client';

import { useState, useEffect } from 'react';
import { partnerService } from '@/services/partnerService';
import { PartnerEarningsData } from '@/types';
import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, Filter, Navigation } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function PartnerEarningsPage() {
  const [earnings, setEarnings] = useState<PartnerEarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await partnerService.getEarnings();
        if (response.success) setEarnings(response.data);
      } catch (err) {
        console.error('Failed to fetch earnings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center text-white p-8 bg-gradient-to-r from-[#E32222] to-emerald-600 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-3xl font-bold">My Earnings</h1>
          <p className="text-white/80 mt-1">Track your income and ride payouts.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Today's Payout</p>
          <p className="text-4xl font-black">₹{earnings?.todayEarnings?.toLocaleString('en-IN') || '0'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EarningCard 
          label="Total Earnings" 
          value={`₹${earnings?.total?.toLocaleString('en-IN') || '0'}`} 
          trend="+8%" 
          isPositive={true}
          description="Life-time earnings on platform"
        />
        <EarningCard 
          label="Session Earnings" 
          value={`₹${earnings?.sessionEarnings?.toLocaleString('en-IN') || '0'}`} 
          trend="+15%" 
          isPositive={true}
          description="Earnings from current session"
          highlight={true}
        />
        <EarningCard 
          label="Total Gross Fare" 
          value={`₹${earnings?.totalFare?.toLocaleString('en-IN') || '0'}`} 
          trend="+5%" 
          isPositive={true}
          description="Gross amount collected"
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Navigation className="text-emerald-500" /> Recent Ride Payouts
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white">
                <th className="text-left py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-gray-400">Date & Ride ID</th>
                <th className="text-left py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-gray-400">Status</th>
                <th className="text-left py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-gray-400 text-right">Total Fare</th>
                <th className="text-left py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-gray-400 text-right">Commission</th>
                <th className="text-left py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-gray-400 text-right text-emerald-600">Your Earning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {earnings?.recentRides.map((item, i) => (
                <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-gray-800">{new Date(item.date).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-400 font-mono italic">#{item.rideId.slice(-6)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg">COMPLETED</span>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-gray-800">₹{item.totalFare}</td>
                  <td className="py-4 px-6 text-right font-medium text-red-400">₹{item.commission}</td>
                  <td className="py-4 px-6 text-right font-bold text-emerald-600">₹{item.earning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EarningCard({ label, value, trend, isPositive, description, highlight }: any) {
  return (
    <div className={`p-8 rounded-3xl border ${highlight ? 'bg-emerald-500 border-none shadow-xl shadow-emerald-500/20 text-white' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${highlight ? 'bg-white/10' : 'bg-gray-50'}`}>
          <DollarSign size={24} className={highlight ? 'text-white' : 'text-emerald-500'} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${highlight ? 'bg-white/20 text-white' : isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${highlight ? 'text-emerald-100' : 'text-gray-400'}`}>{label}</p>
        <p className="text-3xl font-black mb-2">{value}</p>
        <p className={`text-[10px] font-medium ${highlight ? 'text-emerald-100/70' : 'text-gray-400'}`}>{description}</p>
      </div>
    </div>
  );
}
