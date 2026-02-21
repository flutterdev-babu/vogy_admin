'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Search, Eye, Phone, Mail, MapPin, Plus, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { vendorService } from '@/services/vendorService';
import { Vendor, EntityActiveStatus, EntityVerificationStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';

const activeStatusColors: Record<EntityActiveStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
  SUSPENDED: 'bg-yellow-100 text-yellow-700',
  BANNED: 'bg-red-100 text-red-700',
};

const verifyStatusColors: Record<EntityVerificationStatus, string> = {
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  VERIFIED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<EntityActiveStatus | ''>('');
  const [filters, setFilters] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    city: '',
  });

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const response = await vendorService.getAll({
        status: statusFilter || undefined,
      });
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
  }, [statusFilter]);

  const handleStatusUpdate = async (vendor: Vendor, status: EntityActiveStatus) => {
    try {
      await vendorService.updateStatus(vendor.id, status);
      toast.success(`Vendor status updated to ${status}`);
      fetchVendors();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleVerify = async (vendor: Vendor, status: EntityVerificationStatus) => {
    try {
      await vendorService.verify(vendor.id, status);
      toast.success(`Vendor verification set to ${status}`);
      fetchVendors();
    } catch (error) {
      toast.error('Failed to update verification');
    }
  };

  const handleDelete = async (vendor: Vendor) => {
    if (!window.confirm('Are you sure you want to delete this vendor? This action is permanent.')) return;
    try {
      await vendorService.deleteVendor(vendor.id);
      toast.success('Vendor deleted successfully');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to delete vendor');
    }
  };

  const filteredVendors = vendors.filter(v => {
    const nameMatch = !filters.name || v.name.toLowerCase().includes(filters.name.toLowerCase());
    const companyMatch = !filters.company || v.companyName.toLowerCase().includes(filters.company.toLowerCase());
    const phoneMatch = !filters.phone || v.phone.includes(filters.phone);
    const emailMatch = !filters.email || (v.email && v.email.toLowerCase().includes(filters.email.toLowerCase()));
    const cityMatch = !filters.city || (v.cityCode?.cityName?.toLowerCase().includes(filters.city.toLowerCase()));
    return nameMatch && companyMatch && phoneMatch && emailMatch && cityMatch;
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      {/* Page Title & Actions */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Vendors</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage fleet owners and vehicle providers</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">
            {vendors.length} Total
          </span>
          <Link
            href="/dashboard/vendors/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] shadow-lg shadow-red-500/20 text-sm font-semibold transition-all"
          >
            <Plus size={16} />
            Add Vendor
          </Link>
          <button 
            onClick={fetchVendors}
            className="p-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] shadow-lg shadow-red-500/20"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EntityActiveStatus | '')}
          className="text-xs p-2 border border-gray-200 rounded-lg bg-white outline-none min-w-[120px]"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BANNED">Banned</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            {/* Header */}
            <thead className="bg-[#E32222] text-white">
              <tr>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[100px]">ID</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Owner</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Company</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Phone</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Email</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">City</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[80px]">GST</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[100px]">Status</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[140px]">Actions</th>
              </tr>
            </thead>
            {/* Filter Row */}
            <tbody className="bg-gray-50 border-b border-gray-200">
              <tr>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Search" className="w-full text-[11px] p-1 border border-red-200 rounded outline-none focus:border-red-400"
                    value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} />
                </td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Search" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none"
                    value={filters.company} onChange={e => setFilters({...filters, company: e.target.value})} />
                </td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Search" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none"
                    value={filters.phone} onChange={e => setFilters({...filters, phone: e.target.value})} />
                </td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Search" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none"
                    value={filters.email} onChange={e => setFilters({...filters, email: e.target.value})} />
                </td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Search" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none"
                    value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} />
                </td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
              </tr>
            </tbody>
            {/* Data Rows */}
            <tbody className="divide-y divide-gray-100">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500 italic">No vendors found.</td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-3 py-3">
                      <span className="text-[11px] font-bold text-orange-600 font-mono">{vendor.customId}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
                          <Building2 size={14} className="text-white" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-800">{vendor.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[11px] font-medium text-gray-700">{vendor.companyName}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[10px] font-medium text-gray-600">{vendor.phone}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[10px] font-medium text-gray-600 truncate block max-w-[160px]">{vendor.email || '-'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[10px] font-medium text-gray-600">{vendor.cityCode?.cityName || '-'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[10px] font-medium text-gray-500">{vendor.gstNumber ? '✓' : '-'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase w-fit ${activeStatusColors[vendor.status] || 'bg-gray-100 text-gray-700'}`}>
                          Status: {vendor.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase w-fit ${verifyStatusColors[vendor.verifyStatus] || 'bg-gray-100 text-gray-700'}`}>
                          Verify: {vendor.verifyStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) handleStatusUpdate(vendor, e.target.value as EntityActiveStatus);
                          }}
                          className="text-[9px] p-1 border border-gray-200 rounded bg-white outline-none cursor-pointer"
                        >
                          <option value="">Status</option>
                          <option value="ACTIVE">Activate</option>
                          <option value="INACTIVE">Deactivate</option>
                          <option value="SUSPENDED">Suspend</option>
                          <option value="BANNED">Ban</option>
                        </select>
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) handleVerify(vendor, e.target.value as EntityVerificationStatus);
                          }}
                          className="text-[9px] p-1 border border-gray-200 rounded bg-white outline-none cursor-pointer"
                        >
                          <option value="">Verify</option>
                          <option value="VERIFIED">Verify</option>
                          <option value="REJECTED">Reject</option>
                          <option value="UNDER_REVIEW">Review</option>
                        </select>
                        <Link href={`/dashboard/vendors/${vendor.id}/edit`} className="p-1 px-2 text-blue-600 hover:bg-blue-50 rounded text-[9px] font-bold flex items-center gap-1">
                          <Eye size={12} /> Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(vendor)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Vendor"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-500">Showing <span className="font-bold text-[#E32222]">{filteredVendors.length}</span> of {vendors.length} vendors</span>
          <div className="flex gap-1">
            <button className="p-1 border rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14}/></button>
            <button className="p-1 border rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
