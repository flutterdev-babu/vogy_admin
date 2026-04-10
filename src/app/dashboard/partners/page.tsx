'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserCheck, Search, Filter, CheckCircle, XCircle, Clock, Eye, Phone, Wifi, WifiOff, Plus, ChevronLeft, ChevronRight, RotateCcw, MapPin, Car } from 'lucide-react';
import { partnerService } from '@/services/partnerService';
import { Partner, EntityActiveStatus, EntityVerificationStatus } from '@/types';
import { TableSkeleton } from '@/components/ui/Skeletons';
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

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<EntityActiveStatus | ''>('');
  const [onlineFilter, setOnlineFilter] = useState<string>('');
  const [filters, setFilters] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    customId: '',
    vendorSearch: '',
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const response = await partnerService.getAll({
        status: statusFilter || undefined,
        isOnline: onlineFilter === '' ? undefined : onlineFilter === 'true',
      });
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
  }, [statusFilter, onlineFilter]);

  const handleStatusUpdate = async (partner: Partner, status: EntityActiveStatus) => {
    try {
      await partnerService.updateStatus(partner.id, status);
      toast.success(`Partner status updated to ${status}`);
      fetchPartners();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleVerify = async (partner: Partner, status: EntityVerificationStatus) => {
    try {
      await partnerService.verify(partner.id, status);
      toast.success(`Partner verification set to ${status}`);
      fetchPartners();
    } catch (error) {
      toast.error('Failed to update verification');
    }
  };

  const handleDelete = async (partner: Partner) => {
    if (!window.confirm('Are you sure you want to delete this partner? This action is permanent.')) return;
    try {
      await partnerService.deletePartner(partner.id);
      toast.success('Partner deleted successfully');
      fetchPartners();
    } catch (error) {
      toast.error('Failed to delete partner');
    }
  };

  const handleBulkAction = async (action: 'APPROVE' | 'SUSPEND') => {
    if (!window.confirm(`Are you sure you want to bulk ${action.toLowerCase()} ${selectedIds.length} partners?`)) return;

    setIsBulkProcessing(true);
    const newStatus: EntityActiveStatus = action === 'APPROVE' ? 'ACTIVE' : 'SUSPENDED';

    let successCount = 0;
    let failCount = 0;

    // Use allSettled for safe scaling without blocking other requests on a single failure
    const promises = selectedIds.map(id => partnerService.updateStatus(id, newStatus));
    const results = await Promise.allSettled(promises);

    results.forEach((res, index) => {
      const pid = selectedIds[index];
      if (res.status === 'fulfilled' && (res.value as any)?.success !== false) {
        successCount++;
        console.log(`[BULK ${action}] SUCCESS: Partner ${pid}`);
      } else {
        failCount++;
        console.error(`[BULK ${action}] FAILED: Partner ${pid}`, res.status === 'rejected' ? res.reason : res.value);
      }
    });

    if (failCount === 0) {
      toast.success(`Successfully updated ${successCount} partners!`);
    } else {
      toast.error(`${successCount} updated, ${failCount} failed.`);
    }

    setSelectedIds([]);
    setIsBulkProcessing(false);
    fetchPartners();
  };

  const filteredPartners = partners.filter(p => {
    const nameMatch = !filters.name || p.name.toLowerCase().includes(filters.name.toLowerCase());
    const phoneMatch = !filters.phone || p.phone.includes(filters.phone);
    const emailMatch = !filters.email || (p.email && p.email.toLowerCase().includes(filters.email.toLowerCase()));
    const cityMatch = !filters.city || (p.cityCode?.cityName?.toLowerCase().includes(filters.city.toLowerCase()));
    const customIdMatch = !filters.customId || (p.customId?.toLowerCase().includes(filters.customId.toLowerCase())) || p.id.toLowerCase().includes(filters.customId.toLowerCase());

    // Vendor match (checking vendor.customId, partner.vendorCustomId, etc)
    const vendorObj = p.vendor;
    const vSearch = filters.vendorSearch.toLowerCase();
    const vendorMatch = !filters.vendorSearch ||
      (vendorObj?.customId?.toLowerCase().includes(vSearch)) ||
      (vendorObj?.name?.toLowerCase().includes(vSearch)) ||
      (vendorObj?.companyName?.toLowerCase().includes(vSearch)) ||
      (p.vendorCustomId?.toLowerCase().includes(vSearch));

    return nameMatch && phoneMatch && emailMatch && cityMatch && customIdMatch && vendorMatch;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(filteredPartners.map(p => p.id));
    else setSelectedIds([]);
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (isLoading) return <div className="p-4"><TableSkeleton rows={10} /></div>;

  const onlineCount = partners.filter(p => p.isOnline).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Partners</h1>
          <p className="text-sm text-gray-500 font-medium">Manage and monitor your delivery workforce</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
            <div className="px-4 py-2 flex flex-col items-center border-r border-gray-100">
              <span className="text-xl font-black text-green-600 leading-none">{onlineCount}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
              </span>
            </div>
            <div className="px-4 py-2 flex flex-col items-center">
              <span className="text-xl font-black text-gray-900 leading-none">{partners.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Total</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/partners/create"
              className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-2xl hover:bg-black shadow-lg shadow-gray-200 text-sm font-bold transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={18} />
              New Partner
            </Link>
            <button
              onClick={fetchPartners}
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
              placeholder="Quick search by name, phone, or partner code..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#E32222]/20 outline-none transition-all placeholder:text-gray-400"
              value={filters.customId}
              onChange={e => setFilters({ ...filters, customId: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EntityActiveStatus | '')}
                className="pl-9 pr-8 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-600 appearance-none focus:ring-2 focus:ring-[#E32222]/20 outline-none cursor-pointer"
              >
                <option value="">Status: All</option>
                <option value="ACTIVE text-green-600">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>

            <div className="relative">
              <Wifi size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={onlineFilter}
                onChange={(e) => setOnlineFilter(e.target.value)}
                className="pl-9 pr-8 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-600 appearance-none focus:ring-2 focus:ring-[#E32222]/20 outline-none cursor-pointer"
              >
                <option value="">Online: All</option>
                <option value="true">Online Now</option>
                <option value="false">Offline</option>
              </select>
            </div>

            <button
              onClick={() => setFilters({ name: '', phone: '', email: '', city: '', customId: '', vendorSearch: '' })}
              className="px-4 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Extended Filters (Hidden Row) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-1">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1 font-mono">Filter by Name</label>
            <input type="text" placeholder="Driver name..." className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-gray-200 outline-none"
              value={filters.name} onChange={e => setFilters({ ...filters, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1 font-mono">Contact Details</label>
            <input type="text" placeholder="Phone or Email..." className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-gray-200 outline-none"
              value={filters.phone} onChange={e => setFilters({ ...filters, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1 font-mono">Vendor / Agency</label>
            <input type="text" placeholder="Vendor code or name..." className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-gray-200 outline-none"
              value={filters.vendorSearch} onChange={e => setFilters({ ...filters, vendorSearch: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1 font-mono">City / Hub</label>
            <input type="text" placeholder="Search by city..." className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-gray-200 outline-none"
              value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-5 w-[60px]">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 checked:bg-gray-900"
                      checked={selectedIds.length === filteredPartners.length && filteredPartners.length > 0}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Identity</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Personal Info</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Agency/Vendor</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Hub Location</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Vehicle Meta</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Verification status</th>
                <th className="px-4 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Search size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-400">No matches found for your current filters</p>
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr key={partner.id} className={`group transition-all duration-200 ${selectedIds.includes(partner.id) ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 checked:bg-gray-900"
                          checked={selectedIds.includes(partner.id)}
                          onChange={() => handleSelectRow(partner.id)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-gray-900 tracking-tight font-mono mb-0.5">
                          {partner.customId || partner.id.slice(-8).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {partner.isOnline ? (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span className="text-[8px] font-black text-green-600 uppercase tracking-widest">Active Now</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Offline</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900">{partner.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-gray-500">{partner.phone}</span>
                          <div className="w-1 h-1 rounded-full bg-gray-200" />
                          <span className="text-[10px] font-medium text-gray-400 truncate max-w-[120px]">{partner.email || 'No email'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {partner.vendor ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck size={10} className="text-gray-400" />
                            <span className="text-[10px] font-black text-gray-700 tracking-tight">{partner.vendor.customId}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 truncate max-w-[140px] mt-0.5">{partner.vendor.companyName}</span>
                        </div>
                      ) : (
                        <div className="inline-flex px-2 py-0.5 bg-gray-100 rounded-md">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Independent</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-[11px] font-black text-gray-700">{partner.cityCode?.cityName || 'Unset'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {partner.vehicle ? (
                        <div className="flex flex-col bg-gray-50 p-2 rounded-xl border border-gray-100/50">
                          <span className="text-[10px] font-black text-gray-900">{partner.vehicle.vehicleModel}</span>
                          <span className="text-[9px] font-bold text-gray-400 font-mono mt-0.5 uppercase tracking-wider">{partner.vehicle.registrationNumber}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <Car size={14} />
                          <span className="text-[10px] font-bold italic">No vehicle</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[160px]">
                        <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 ${activeStatusColors[partner.status] || 'bg-gray-100 text-gray-700'}`}>
                          <div className={`w-1 h-1 rounded-full ${partner.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{partner.status}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 ${verificationStatusColors[partner.verificationStatus] || 'bg-gray-100 text-gray-700'}`}>
                          <span className="text-[9px] font-black uppercase tracking-widest">{partner.verificationStatus}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                        <div className="relative group/actions">
                          <button className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900">
                            <Filter size={16} />
                          </button>
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 hidden group-hover/actions:block z-20">
                            <p className="px-4 py-1 text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Set Active Status</p>
                            {['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED'].map((s) => (
                              <button key={s} onClick={() => handleStatusUpdate(partner, s as any)} className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                                {s} {partner.status === s && <CheckCircle size={10} className="text-green-500" />}
                              </button>
                            ))}
                            <div className="h-px bg-gray-100 my-1" />
                            <p className="px-4 py-1 text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 mt-1">Verification</p>
                            {['VERIFIED', 'REJECTED', 'UNDER_REVIEW'].map((v) => (
                              <button key={v} onClick={() => handleVerify(partner, v as any)} className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                                {v.replace('_', ' ')} {partner.verificationStatus === v && <CheckCircle size={10} className="text-blue-500" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <Link
                          href={`/dashboard/partners/${partner.id}/view`}
                          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-xl transition-all shadow-sm"
                          title="View Partner Profile"
                        >
                          <Eye size={16} />
                        </Link>

                        <button
                          onClick={() => handleDelete(partner)}
                          className="p-2 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                          title="Terminate Partner"
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

        {/* Modern Footer (Pagination) */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-gray-50 bg-gray-50/30">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900">{filteredPartners.length}</span> of {partners.length} registered partners
          </span>
          <div className="flex items-center gap-1.5">
            <button className="flex items-center gap-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors">
              <ChevronLeft size={16} /> Prev
            </button>
            <div className="flex items-center gap-1 px-2">
              <div className="w-2 h-2 rounded-full bg-gray-900" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            </div>
            <button className="flex items-center gap-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-900 hover:text-black disabled:opacity-30 transition-colors">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>

  );
}
