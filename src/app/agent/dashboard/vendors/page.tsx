'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Search, Eye, Phone, MapPin, Plus, RotateCcw, Filter as FilterIcon } from 'lucide-react';
import { agentService } from '@/services/agentService';
import { Vendor, EntityActiveStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const activeStatusColors: Record<EntityActiveStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
  SUSPENDED: 'bg-yellow-100 text-yellow-700',
  BANNED: 'bg-red-100 text-red-700',
};

export default function AgentVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    company: '',
  });

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const response = await agentService.getVendors();
      if (response.success) {
        setVendors(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(v => {
    const nameMatch = !filters.name || v.name.toLowerCase().includes(filters.name.toLowerCase());
    const companyMatch = !filters.company || v.companyName.toLowerCase().includes(filters.company.toLowerCase());
    return nameMatch && companyMatch;
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase leading-none">My Vendors</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Logistical partners referred by you</p>
        </div>
        <div className="flex items-center gap-3">
            <Link
              href="/agent/dashboard/vendors/register"
              className="flex items-center gap-2 px-6 py-3 bg-[#E32222] text-white rounded-2xl hover:bg-[#ff1a1a] shadow-lg shadow-red-100 text-xs font-black uppercase tracking-widest transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={18} />
              Register New Vendor
            </Link>
            <button
              onClick={fetchVendors}
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
              placeholder="Search vendors..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#E32222]/10 transition-all"
              value={filters.name}
              onChange={e => setFilters({ ...filters, name: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-4">Total: {filteredVendors.length}</span>
          </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendor</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-4 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Building2 size={48} className="text-gray-100 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">No vendors found</p>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black border border-orange-100">
                          {vendor.name[0].toUpperCase()}
                        </div>
                        <div>
                           <p className="text-sm font-black text-gray-800 tracking-tight">{vendor.name}</p>
                           <p className="text-[10px] font-mono text-orange-500 font-bold">{vendor.customId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-sm font-bold text-gray-600">{vendor.companyName}</p>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                           <Phone size={12} /> {vendor.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                           <MapPin size={12} /> {vendor.cityCode?.cityName || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${activeStatusColors[vendor.status]}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#E32222] hover:text-white transition-all shadow-sm">
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
