'use client';

import { useEffect, useState } from 'react';
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">💸 Settlements & Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage partner & vendor earnings</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-xs font-bold uppercase rounded-lg hover:bg-green-100 border border-green-200 transition-all"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-blue-50 text-blue-600', iconBg: 'bg-blue-100' },
            { label: 'Rider Earnings', value: `₹${(stats.totalRiderEarnings || 0).toLocaleString()}`, icon: Wallet, color: 'bg-green-50 text-green-600', iconBg: 'bg-green-100' },
            { label: 'Commission', value: `₹${(stats.totalCommission || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-purple-50 text-purple-600', iconBg: 'bg-purple-100' },
            { label: 'Pending Payments', value: `${stats.pendingPayments || 0}`, icon: Users, color: 'bg-orange-50 text-orange-600', iconBg: 'bg-orange-100' },
          ].map((card, i) => (
            <div key={i} className={`${card.color} rounded-2xl p-5 border border-gray-100`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                  <card.icon size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-70">{card.label}</span>
              </div>
              <p className="text-2xl font-black">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-200 w-fit">
        {(['partners', 'vendors'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all capitalize ${activeTab === tab
              ? 'bg-[#E32222] text-white shadow-md shadow-red-500/20'
              : 'text-gray-500 hover:bg-gray-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Settlement Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">ID</th>
              <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Name</th>
              <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Phone</th>
              <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Rides</th>
              <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Total Fare</th>
              <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Earnings</th>
              <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Commission</th>
              <th className="text-center py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-gray-400 text-sm">No settlement data found.</td></tr>
            ) : (
              data.map((item) => (
                <>
                  <tr key={item.entityId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-[#E32222]">{item.customId}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-800">{item.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.phone}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-800 text-right">{item.totalRides}</td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-800 text-right">₹{item.totalFare.toFixed(2)}</td>
                    <td className="py-4 px-6 text-sm font-black text-green-600 text-right">₹{item.totalEarnings.toFixed(2)}</td>
                    <td className="py-4 px-6 text-sm font-bold text-purple-600 text-right">₹{item.totalCommission.toFixed(2)}</td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setExpandedId(expandedId === item.entityId ? null : item.entityId)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {expandedId === item.entityId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === item.entityId && (
                    <tr key={`${item.entityId}-detail`}>
                      <td colSpan={8} className="bg-gray-50/50 px-8 py-4">
                        <div className="text-xs font-bold uppercase text-gray-400 mb-3">Recent Rides</div>
                        <div className="grid gap-2 max-h-60 overflow-y-auto">
                          {item.rides.slice(0, 10).map((ride: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-gray-100 text-xs">
                              <span className="font-bold text-gray-700">{ride.customId || 'N/A'}</span>
                              <span className="text-gray-500">{new Date(ride.date).toLocaleDateString()}</span>
                              <span className="text-gray-500">{ride.vehicleType}</span>
                              <span className="font-bold text-green-600">₹{(ride.riderEarnings || ride.totalFare || 0).toFixed(2)}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ride.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {ride.paymentStatus || ride.paymentMode || 'N/A'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
