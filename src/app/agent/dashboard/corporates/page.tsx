'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Search, Eye, Phone, MapPin, Plus, RotateCcw, DollarSign } from 'lucide-react';
import { agentService } from '@/services/agentService';
import { Corporate, EntityStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const statusColors: Record<EntityStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
  SUSPENDED: 'bg-yellow-100 text-yellow-700',
  BANNED: 'bg-red-100 text-red-700',
  PENDING: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-blue-100 text-blue-700',
};

export default function AgentCorporatesPage() {
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCorporates = async () => {
    setIsLoading(true);
    try {
      const response = await agentService.getCorporates();
      if (response.success) {
        setCorporates(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch corporates:', error);
      toast.error('Failed to load corporates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCorporates();
  }, []);

  const filteredCorporates = corporates.filter(c => 
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.customId && c.customId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase leading-none">Corporate Clients</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Companies registered under your referral</p>
        </div>
        <div className="flex items-center gap-3">
            <Link
              href="/agent/dashboard/corporates/register"
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 shadow-lg shadow-purple-100 text-xs font-black uppercase tracking-widest transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={18} />
              New Corporate
            </Link>
            <button
              onClick={fetchCorporates}
              className="p-3 bg-white text-gray-400 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all shadow-sm"
            >
              <RotateCcw size={20} />
            </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Search companies..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-purple-600/10 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Person</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Credit Status</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCorporates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Briefcase size={48} className="text-gray-100 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">No corporates found</p>
                  </td>
                </tr>
              ) : (
                filteredCorporates.map((corp) => (
                  <tr key={corp.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black border border-purple-100">
                          {corp.companyName[0].toUpperCase()}
                        </div>
                        <div>
                           <p className="text-sm font-black text-gray-800 tracking-tight">{corp.companyName}</p>
                           <p className="text-[10px] font-mono text-purple-500 font-bold uppercase">{corp.customId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-gray-600">{corp.contactPerson}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{corp.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl">
                           <p className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">Balance</p>
                           <p className="text-xs font-black text-blue-700">₹{corp.currentBalance?.toLocaleString() || 0}</p>
                        </div>
                        <div className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Limit</p>
                           <p className="text-xs font-black text-gray-600">₹{corp.creditLimit?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColors[corp.status]}`}>
                        {corp.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-purple-600 hover:text-white transition-all shadow-sm">
                          <Eye size={18} />
                       </button>
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
