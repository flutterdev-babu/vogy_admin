'use client';

import { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { Users, RefreshCw, ChevronLeft, ChevronRight, MoreHorizontal, Search, Plus } from 'lucide-react';
import Link from 'next/link';

interface Partner {
  id: string;
  customId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  localAddress?: string;
  dlNumber?: string;
  licenseNumber?: string;
  bankAccountNumber?: string;
  upiId?: string;
  rating?: number;
  createdAt: string;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState({
    id: '', name: '', phone: ''
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await agentService.getPartners();
      setPartners(res.data);
    } catch (err) {
      console.error('Failed to fetch partners:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter(p => {
    const fullName = p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim();
    const partnerId = p.customId || p.id;
    return (
      partnerId.toLowerCase().includes(searchFilters.id.toLowerCase()) &&
      fullName.toLowerCase().includes(searchFilters.name.toLowerCase()) &&
      p.phone.includes(searchFilters.phone)
    );
  });

  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage);
  const paginatedPartners = filteredPartners.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getDisplayName = (p: Partner) => p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'N/A';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Partner List</h1>
        <div className="flex gap-2">
          <Link
            href="/agent/dashboard/partners/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] transition-colors"
          >
            <Plus size={18} />
            Add Partner
          </Link>
          <button
            onClick={fetchPartners}
            className="p-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="flex justify-end items-center gap-2 text-sm text-gray-600">
        <span>{(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredPartners.length)}</span>
        <span className="text-[#E32222]">▼</span>
        <span>of {filteredPartners.length}</span>
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E32222]"></div>
          </div>
        ) : (
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="bg-[#E32222] text-white text-sm">
                <th className="px-4 py-3 text-left font-medium">Partner ID</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Mobile</th>
                <th className="px-4 py-3 text-left font-medium">Local Add.</th>
                <th className="px-4 py-3 text-left font-medium">DL Number</th>
                <th className="px-4 py-3 text-left font-medium">Bank A/C No.</th>
                <th className="px-4 py-3 text-left font-medium">UPI ID</th>
                <th className="px-4 py-3 text-left font-medium">Rating</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
              </tr>
              {/* Search Row */}
              <tr className="bg-white border-b">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchFilters.id}
                    onChange={(e) => setSearchFilters({...searchFilters, id: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E32222]"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchFilters.name}
                    onChange={(e) => setSearchFilters({...searchFilters, name: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E32222]"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchFilters.phone}
                    onChange={(e) => setSearchFilters({...searchFilters, phone: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#E32222]"
                  />
                </td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2"></td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <button className="p-1 bg-[#E32222] text-white rounded">
                      <Search size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            </thead>
            <tbody>
              {paginatedPartners.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p>No partners found</p>
                  </td>
                </tr>
              ) : (
                paginatedPartners.map((partner, idx) => (
                  <tr key={partner.id} className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3 text-sm text-gray-700">{partner.customId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{getDisplayName(partner)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{partner.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[150px] truncate">{partner.localAddress || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{partner.dlNumber || partner.licenseNumber || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{partner.bankAccountNumber || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{partner.upiId || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{partner.rating || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreHorizontal size={18} className="text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
