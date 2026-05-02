'use client';

import { useState, useEffect } from 'react';
import { Clock, Search, Eye, MapPin, RotateCcw, Calendar, Car } from 'lucide-react';
import { agentService } from '@/services/agentService';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  ONGOING: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  ASSIGNED: 'bg-purple-100 text-purple-700',
};

export default function AgentRidesPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRides = async () => {
    setIsLoading(true);
    try {
      const response = await agentService.getAgentRides();
      if (response.success) {
        setRides(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch rides:', error);
      toast.error('Failed to load rides');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const filteredRides = rides.filter(r => 
    (r.customId && r.customId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.pickupLocation && r.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.dropoffLocation && r.dropoffLocation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase leading-none">Ride Management</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">All trips sourced via your referral network</p>
        </div>
        <button
          onClick={fetchRides}
          className="p-3 bg-white text-gray-400 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all shadow-sm"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Search by ride ID or location..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-gray-200 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trip Details</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Route</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Partnership</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Fare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Clock size={48} className="text-gray-100 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">No ride history found</p>
                  </td>
                </tr>
              ) : (
                filteredRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center border border-gray-100">
                          <Car size={18} />
                        </div>
                        <div>
                           <p className="text-xs font-black text-gray-800 tracking-tight font-mono">{ride.customId || 'N/A'}</p>
                           <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                              <Calendar size={10} /> {new Date(ride.createdAt).toLocaleDateString()}
                           </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 max-w-[300px]">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-start gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1" />
                           <p className="text-[10px] font-bold text-gray-600 line-clamp-1">{ride.pickupLocation}</p>
                        </div>
                        <div className="flex items-start gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1" />
                           <p className="text-[10px] font-bold text-gray-600 line-clamp-1">{ride.dropoffLocation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black text-gray-700 uppercase tracking-tighter">{ride.vendor?.companyName || 'Ara Travels'}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{ride.partner?.name || 'Unassigned'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusColors[ride.status] || 'bg-gray-100'}`}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-gray-800 tracking-tight">
                       ₹{ride.totalFare?.toLocaleString() || '0'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
