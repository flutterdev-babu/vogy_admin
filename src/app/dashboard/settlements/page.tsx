'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, Users, TrendingUp, Wallet, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { settlementService } from '@/services/enterpriseService';
import { exportToCSV } from '@/utils/csvExport';
import { PageLoader } from '@/components/ui/LoadingSpinner';

interface SettlementSummary {
  entityId: string;
  entityType: string;
  name: string;
  phone: string;
  customId: string;
  totalRides: number;
  totalFare: number;
  totalEarnings: number;
  totalCommission: number;
  rides: any[];
}

export default function SettlementsPage() {
  const [activeTab, setActiveTab] = useState<'partners' | 'vendors'>('partners');
  const [data, setData] = useState<SettlementSummary[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, settlementsRes] = await Promise.all([
        settlementService.getStats(),
        activeTab === 'partners' ? settlementService.getPartnerSettlements() : settlementService.getVendorSettlements(),
      ]);
      setStats(statsRes.data);
      setData(settlementsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleExport = () => {
    const exportData = data.map(item => ({
      'ID': item.customId,
      'Name': item.name,
      'Phone': item.phone,
      'Total Rides': item.totalRides,
      'Total Fare (₹)': item.totalFare.toFixed(2),
      'Earnings (₹)': item.totalEarnings.toFixed(2),
      'Commission (₹)': item.totalCommission.toFixed(2),
    }));
    exportToCSV(exportData, `Settlements_${activeTab}_${new Date().toISOString().slice(0, 10)}`);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            Financial Core
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">Settlements & Distributed Payouts Ledger</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-100 border border-emerald-100 transition-all shadow-sm"
        >
          <Download size={16} /> EXPORT FISCAL LEDGER
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'GROSS REVENUE', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
            { label: 'PARTNER YIELD', value: `₹${(stats.totalRiderEarnings || 0).toLocaleString()}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
            { label: 'SYSTEM ROYALTY', value: `₹${(stats.totalCommission || 0).toLocaleString()}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50/50' },
            { label: 'OPEN DISBURSEMENTS', value: `${stats.pendingPayments || 0}`, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50/50' },
          ].map((card, i) => (
            <div key={i} className={`bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md group`}>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <card.icon size={22} />
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</span>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">{card.value}</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Real-time update</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
        {/* Premium Segmented Control */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200/50 shadow-inner overflow-hidden max-w-fit">
          {(['partners', 'vendors'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                ? 'bg-white text-gray-900 shadow-md ring-1 ring-gray-100'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="px-6 py-4 bg-gray-900 rounded-[1.5rem] flex items-center justify-between min-w-[200px]">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate mr-4">Total Settled Entities</span>
          <span className="text-sm font-black text-white">{data.length}</span>
        </div>
      </div>

      {/* Settlement Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 mb-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fiscal Distributions</h3>
          {isLoading && <span className="text-[9px] font-black text-gray-300 uppercase animate-pulse">Synchronizing ledger...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset ID</th>
                <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Entity Identity</th>
                <th className="text-right py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Volume</th>
                <th className="text-right py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Gross Revenue</th>
                <th className="text-right py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Distribution</th>
                <th className="text-right py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Royalty</th>
                <th className="text-center py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <DollarSign size={48} />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">No financial data detected</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <React.Fragment key={item.entityId}>
                    <tr className="group hover:bg-gray-50/50 transition-all">
                      <td className="py-5 px-8">
                        <span className="text-xs font-black text-red-600 tracking-tight font-mono">{item.customId}</span>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 tracking-tight leading-none uppercase">{item.name}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase mt-1.5 tracking-tighter">{item.phone}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <span className="text-xs font-black text-gray-900">{item.totalRides}</span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <span className="text-xs font-black text-gray-900">₹{item.totalFare.toLocaleString()}</span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <span className="text-xs font-black text-emerald-600">₹{item.totalEarnings.toLocaleString()}</span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <span className="text-xs font-black text-indigo-500">₹{item.totalCommission.toLocaleString()}</span>
                      </td>
                      <td className="py-5 px-8 text-center">
                        <button
                          onClick={() => setExpandedId(expandedId === item.entityId ? null : item.entityId)}
                          className={`w-10 h-10 inline-flex items-center justify-center rounded-2xl transition-all ${expandedId === item.entityId
                            ? 'bg-gray-900 text-white shadow-lg'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                            }`}
                        >
                          {expandedId === item.entityId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === item.entityId && (
                      <tr key={`${item.entityId}-detail`}>
                        <td colSpan={7} className="bg-gray-50/50 px-12 py-8 border-y border-gray-100">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Transaction Micro-Ledger</h4>
                            <span className="text-[9px] font-bold text-gray-400 uppercase">Showing last 10 distributions</span>
                          </div>
                          <div className="grid gap-3 max-h-80 overflow-y-auto pr-4 scrollbar-thin">
                            {item.rides.slice(0, 10).map((ride: any, i: number) => (
                              <div key={i} className="flex items-center justify-between bg-white rounded-[1.25rem] px-6 py-4 border border-gray-100 shadow-sm animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                                <div className="flex items-center gap-4">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                  <span className="text-[11px] font-black text-gray-900 font-mono tracking-tighter uppercase">{ride.customId || 'TRX-PEND'}</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(ride.date).toLocaleDateString('en-GB')}</span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{ride.vehicleType}</span>
                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <p className="text-[11px] font-black text-gray-900 leading-tight">₹{(ride.riderEarnings || ride.totalFare || 0).toLocaleString()}</p>
                                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Distributed</p>
                                  </div>
                                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${ride.paymentStatus === 'PAID'
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
                                    : 'bg-amber-50 text-amber-600 border border-amber-100/50'
                                    }`}>
                                    {ride.paymentStatus || ride.paymentMode || 'PENDING'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  );
}
