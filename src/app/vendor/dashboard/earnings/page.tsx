'use client';

import { useState, useEffect } from 'react';
import { vendorService } from '@/services/vendorService';
import { VendorEarningsData } from '@/types';
import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, Filter } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function VendorEarningsPage() {
  const [earnings, setEarnings] = useState<VendorEarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await vendorService.getEarnings();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings Detail</h1>
          <p className="text-gray-500 mt-1">Detailed breakdown of your fleet revenue.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            <Calendar size={16} /> Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EarningCard 
          label="Total Revenue" 
          value={`₹${earnings?.summary.totalRevenue.toLocaleString('en-IN') || '0'}`} 
          trend="+12%" 
          isPositive={true}
          description="Gross fare from all rides"
        />
        <EarningCard 
          label="Your Earnings" 
          value={`₹${earnings?.summary.vendorEarnings.toLocaleString('en-IN') || '0'}`} 
          trend="+15%" 
          isPositive={true}
          description="Net profit after commission"
          highlight={true}
        />
        <EarningCard 
          label="Ara Travels Commission" 
          value={`₹${earnings?.summary.vogyCommission.toLocaleString('en-IN') || '0'}`} 
          trend="-2%" 
          isPositive={false}
          description="Platform service fees"
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Recent Breakdowns</h2>
          <span className="text-sm font-bold text-[#E32222]">Total Transactions: {earnings?.breakdown.length || 0}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-gray-400">Date/Time</th>
                <th className="text-left py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-gray-400">Partner / Vehicle</th>
                <th className="text-left py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-gray-400 text-right">Gross Fare</th>
                <th className="text-left py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-gray-400 text-right">Ara Travels Commission</th>
                <th className="text-left py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-gray-400 text-right text-emerald-600">Your Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {earnings?.breakdown.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-gray-800">{new Date(item.date).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-400 font-mono italic">TRX-ID: {Math.random().toString(36).slice(-8).toUpperCase()}</p>
                  </td>
                  <td className="py-4 px-6">
                     <p className="text-sm font-bold text-gray-800">Partner ID: {item.partnerId.slice(-6)}</p>
                     <p className="text-xs text-gray-500 font-medium">Vehicle ID: {item.vehicleId.slice(-6)}</p>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-gray-800">₹{item.totalFare}</td>
                  <td className="py-4 px-6 text-right font-medium text-red-400">₹{item.vogyCommission}</td>
                  <td className="py-4 px-6 text-right font-bold text-emerald-600">₹{item.vendorEarnings}</td>
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
    <div className={`p-8 rounded-3xl border ${highlight ? 'bg-[#E32222] border-none shadow-xl shadow-red-500/20 text-white' : 'bg-white border-gray-100 shadow-sm'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${highlight ? 'bg-white/10' : 'bg-gray-50'}`}>
          <DollarSign size={24} className={highlight ? 'text-white' : 'text-[#E32222]'} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${highlight ? 'bg-white/20 text-white' : isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${highlight ? 'text-red-100' : 'text-gray-400'}`}>{label}</p>
        <p className="text-3xl font-black mb-2">{value}</p>
        <p className={`text-[10px] font-medium ${highlight ? 'text-red-100/70' : 'text-gray-400'}`}>{description}</p>
      </div>
    </div>
  );
}
