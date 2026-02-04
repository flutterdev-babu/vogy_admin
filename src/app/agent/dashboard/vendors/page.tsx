'use client';

import { useState, useEffect } from 'react';
import { agentService } from '@/services/agentService';
import { Building2, RefreshCw, ChevronLeft, ChevronRight, MoreHorizontal, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { Vendor } from '@/types';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState({
    id: '', name: '', phone: '', company: ''
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await agentService.getVendors();
      setVendors(res.data);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => {
    const vendorId = v.customId || v.id;
    return (
      vendorId.toLowerCase().includes(searchFilters.id.toLowerCase()) &&
      v.name.toLowerCase().includes(searchFilters.name.toLowerCase()) &&
      v.phone.includes(searchFilters.phone) &&
      v.companyName.toLowerCase().includes(searchFilters.company.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const paginatedVendors = filteredVendors.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Vendor List</h1>
        <div className="flex gap-2">
          <Link
            href="/agent/dashboard/vendors/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] transition-colors"
          >
            <Plus size={18} />
            Add Vendor
          </Link>
          <button
            onClick={fetchVendors}
            className="p-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="flex justify-end items-center gap-2 text-sm text-gray-600">
        <span>{(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredVendors.length)}</span>
        <span className="text-[#E32222]">▼</span>
        <span>of {filteredVendors.length}</span>
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
                <th className="px-4 py-3 text-left font-medium">Vendor ID</th>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-left font-medium">Mobile</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Address</th>
                <th className="px-4 py-3 text-left font-medium">GST No.</th>
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
                    value={searchFilters.company}
                    onChange={(e) => setSearchFilters({...searchFilters, company: e.target.value})}
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
                <td className="px-4 py-2">
                  <button className="p-1 bg-[#E32222] text-white rounded">
                    <Search size={14} />
                  </button>
                </td>
              </tr>
            </thead>
            <tbody>
              {paginatedVendors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                    <p>No vendors found</p>
                  </td>
                </tr>
              ) : (
                paginatedVendors.map((vendor, idx) => (
                  <tr key={vendor.id} className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3 text-sm text-gray-700">{vendor.customId || vendor.id.slice(-8)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{vendor.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{vendor.companyName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{vendor.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{vendor.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[150px] truncate">{vendor.address || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{vendor.gstNumber || '-'}</td>
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
