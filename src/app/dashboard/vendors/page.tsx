'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Search, Eye, Phone, Mail, MapPin, Plus, ChevronLeft, ChevronRight, RotateCcw, Filter as FilterIcon, CheckCircle } from 'lucide-react';
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

const verificationStatusColors: Record<EntityVerificationStatus, string> = {
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  VERIFIED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  UNVERIFIED: 'bg-gray-100 text-gray-700',
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Vendors</h1>
          <p className="text-sm text-gray-500 font-medium">Manage fleet owners and logistical providers</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
            <div className="px-4 py-2 flex flex-col items-center">
              <span className="text-xl font-black text-gray-900 leading-none">{vendors.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Active Entities</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/vendors/create"
              className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black shadow-lg shadow-gray-200 text-sm font-bold transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={18} />
              Add Vendor
            </Link>
            <button
              onClick={fetchVendors}
              className="p-3 bg-white text-gray-600 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
              title="Refresh List"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Filter Section */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search by company, owner, or vendor code..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-400"
              value={filters.name}
              onChange={e => setFilters({ ...filters, name: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FilterIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EntityActiveStatus | '')}
                className="pl-9 pr-8 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-600 appearance-none focus:ring-2 focus:ring-gray-200 outline-none cursor-pointer"
              >
                <option value="">Status: All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>

            <button
              onClick={() => setFilters({ name: '', company: '', phone: '', email: '', city: '' })}
              className="px-4 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Extended Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Company Name..." className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-gray-200 outline-none"
            value={filters.company} onChange={e => setFilters({ ...filters, company: e.target.value })} />
          <input type="text" placeholder="Contact Details..." className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-gray-200 outline-none"
            value={filters.phone} onChange={e => setFilters({ ...filters, phone: e.target.value })} />
          <input type="text" placeholder="Location Hub..." className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-gray-200 outline-none"
            value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">ID Reference</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Vendor / Owner</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Company Entity</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Contact Primary</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Base Hub</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Regulatory</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Status & Verify</th>
                <th className="px-4 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Building2 size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">No vendors found matching your filters</p>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="group transition-all duration-200 hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-black text-orange-600 tracking-tight font-mono">
                        {vendor.customId}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                          <Building2 size={16} />
                        </div>
                        <span className="text-sm font-black text-gray-900 tracking-tight">{vendor.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[13px] font-black text-gray-800">{vendor.companyName}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <Phone size={10} className="text-gray-400" />
                          <span className="text-[10px] font-black text-gray-700 tracking-tight">{vendor.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Mail size={10} className="text-gray-400" />
                          <span className="text-[10px] font-bold text-gray-400 truncate max-w-[140px]">{vendor.email || 'No email set'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-[11px] font-black text-gray-700">{vendor.cityCode?.cityName || 'Unset'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {vendor.gstNumber ? (
                        <div className="inline-flex px-2 py-0.5 bg-green-50 text-green-600 rounded-md border border-green-100">
                          <span className="text-[9px] font-black uppercase tracking-widest">GST Registered</span>
                        </div>
                      ) : (
                        <div className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-400 rounded-md">
                          <span className="text-[9px] font-black uppercase tracking-widest">No GST info</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[160px]">
                        <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 ${activeStatusColors[vendor.status] || 'bg-gray-100 text-gray-700'}`}>
                          <div className={`w-1 h-1 rounded-full ${vendor.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{vendor.status}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 ${verificationStatusColors[vendor.verificationStatus] || 'bg-gray-100 text-gray-700'}`}>
                          <span className="text-[9px] font-black uppercase tracking-widest">{vendor.verificationStatus}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                        <div className="relative group/actions">
                          <button className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900">
                            <FilterIcon size={16} />
                          </button>
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 hidden group-hover/actions:block z-20">
                            <p className="px-4 py-1 text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Update Status</p>
                            {['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED'].map((s) => (
                              <button key={s} onClick={() => handleStatusUpdate(vendor, s as any)} className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                                {s} {vendor.status === s && <CheckCircle size={10} className="text-green-500" />}
                              </button>
                            ))}
                            <div className="h-px bg-gray-100 my-1" />
                            <p className="px-4 py-1 text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 mt-1">Verification</p>
                            {['VERIFIED', 'REJECTED', 'UNDER_REVIEW'].map((v) => (
                              <button key={v} onClick={() => handleVerify(vendor, v as any)} className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                                {v.replace('_', ' ')} {vendor.verificationStatus === v && <CheckCircle size={10} className="text-blue-500" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <Link
                          href={`/dashboard/vendors/${vendor.id}/edit`}
                          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-xl transition-all shadow-sm"
                          title="Edit Vendor"
                        >
                          <Eye size={16} />
                        </Link>

                        <button
                          onClick={() => handleDelete(vendor)}
                          className="p-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                          title="Delete Vendor"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modern Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-gray-50 bg-gray-50/30">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900">{filteredVendors.length}</span> logistical partners
          </span>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
