'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Eye, Phone, MapPin, Plus, RotateCcw, ShieldCheck } from 'lucide-react';
import { agentService } from '@/services/agentService';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AgentPartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const response = await agentService.getPartners();
      if (response.success) {
        setPartners(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch partners:', error);
      toast.error('Failed to load partners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    (p.customId && p.customId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase leading-none">Partners & Drivers</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Drivers working under your vendor network</p>
        </div>
        <div className="flex items-center gap-3">
            <Link
              href="/agent/dashboard/partners/register"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-100 text-xs font-black uppercase tracking-widest transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={18} />
              Register Partner
            </Link>
            <button
              onClick={fetchPartners}
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
              placeholder="Search partners by name, phone or ID..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
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
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner Name</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendor Context</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Users size={48} className="text-gray-100 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">No partners found</p>
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black border border-blue-100">
                          {partner.name[0].toUpperCase()}
                        </div>
                        <div>
                           <p className="text-sm font-black text-gray-800 tracking-tight">{partner.name}</p>
                           <p className="text-[10px] font-mono text-blue-500 font-bold uppercase">{partner.customId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col">
                        <p className="text-xs font-black text-gray-700">{partner.vendor?.companyName || 'Freelance'}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{partner.vendor?.customId || 'NO VENDOR'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-gray-600">{partner.phone}</p>
                        <div className="flex items-center gap-1 text-[9px] text-gray-400 font-black uppercase tracking-tighter">
                           <MapPin size={10} /> {partner.cityCode?.cityName || 'Unset'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit ${
                          partner.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {partner.status}
                        </span>
                        {partner.hasLicense && (
                          <div className="flex items-center gap-1 text-[8px] font-black text-blue-500 uppercase">
                             <ShieldCheck size={10} /> Licensed
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
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
