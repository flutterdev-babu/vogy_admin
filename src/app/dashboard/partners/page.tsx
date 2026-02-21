'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserCheck, Search, Filter, CheckCircle, XCircle, Clock, Eye, Phone, Wifi, WifiOff, Plus, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { partnerService } from '@/services/partnerService';
import { Partner, EntityActiveStatus, EntityVerificationStatus } from '@/types';
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

  if (isLoading) return <PageLoader />;

  const onlineCount = partners.filter(p => p.isOnline).length;

  return (
    <div className="space-y-4">
      {/* Page Title & Actions */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Partners</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage drivers and delivery partners</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-600 text-xs font-semibold flex items-center gap-1.5">
            <Wifi size={12} /> {onlineCount} Online
          </span>
          <span className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">
            {partners.length} Total
          </span>
          <Link
            href="/dashboard/partners/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] shadow-lg shadow-red-500/20 text-sm font-semibold transition-all"
          >
            <Plus size={16} />
            Add Partner
          </Link>
          <button 
            onClick={fetchPartners}
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
        <select
          value={onlineFilter}
          onChange={(e) => setOnlineFilter(e.target.value)}
          className="text-xs p-2 border border-gray-200 rounded-lg bg-white outline-none min-w-[120px]"
        >
          <option value="">All</option>
          <option value="true">Online</option>
          <option value="false">Offline</option>
        </select>
        <div className="flex-1"></div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Partner Code..." 
            className="text-xs p-2 pl-9 border border-gray-200 rounded-lg bg-white outline-none min-w-[200px]"
            value={filters.customId}
            onChange={e => setFilters({...filters, customId: e.target.value})}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            {/* Header */}
            <thead className="bg-[#E32222] text-white">
              <tr>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[120px]">Partner ID</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Name</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Contact</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Vendor</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">City</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Vehicle</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[80px]">Status</th>
                <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider w-[140px]">Actions</th>
              </tr>
            </thead>
            {/* Filter Row */}
            <tbody className="bg-gray-50 border-b border-gray-200">
              <tr>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Search Name" className="w-full text-[11px] p-1 border border-red-200 rounded outline-none focus:border-red-400"
                    value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} />
                </td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Search Phone/Email" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none"
                    value={filters.phone} onChange={e => setFilters({...filters, phone: e.target.value})} />
                </td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Search Vendor" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none"
                    value={filters.vendorSearch} onChange={e => setFilters({...filters, vendorSearch: e.target.value})} />
                </td>
                <td className="px-2 py-2">
                  <input type="text" placeholder="Search City" className="w-full text-[11px] p-1 border border-gray-200 rounded outline-none"
                    value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} />
                </td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2"></td>
              </tr>
            </tbody>
            {/* Data Rows */}
            <tbody className="divide-y divide-gray-100">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 italic">No partners found.</td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-emerald-600 font-mono">
                          {partner.customId || `PRT-${partner.id.slice(0, 8).toUpperCase()}`}
                        </span>
                        {!partner.customId && <span className="text-[8px] text-gray-400">ID Fallback</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[11px] font-bold text-gray-800">{partner.name}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-medium text-gray-600">{partner.phone}</span>
                        <span className="text-[9px] text-gray-400 truncate max-w-[150px]">{partner.email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {partner.vendor ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-orange-600 font-mono">{partner.vendor.customId}</span>
                          <span className="text-[9px] text-gray-500 truncate max-w-[120px]">{partner.vendor.companyName || partner.vendor.name}</span>
                        </div>
                      ) : partner.vendorCustomId ? (
                        <span className="text-[10px] font-bold text-orange-600 font-mono">{partner.vendorCustomId}</span>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Independent</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[10px] font-medium text-gray-600">{partner.cityCode?.cityName || '-'}</span>
                    </td>
                    <td className="px-3 py-3">
                      {partner.vehicle ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-700">{partner.vehicle.vehicleModel}</span>
                          <span className="text-[9px] text-gray-500 font-mono">{partner.vehicle.registrationNumber}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${activeStatusColors[partner.status] || 'bg-gray-100 text-gray-700'}`}>
                          Status: {partner.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${verifyStatusColors[partner.verifyStatus] || 'bg-gray-100 text-gray-700'}`}>
                          Verify: {partner.verifyStatus}
                        </span>
                        {partner.isOnline ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full text-[8px] font-bold">
                            <Wifi size={8} /> Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded-full text-[8px] font-bold">
                            <WifiOff size={8} /> Offline
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) handleStatusUpdate(partner, e.target.value as EntityActiveStatus);
                          }}
                          className="text-[9px] p-1 border border-gray-200 rounded bg-white outline-none cursor-pointer w-full"
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
                            if (e.target.value) handleVerify(partner, e.target.value as EntityVerificationStatus);
                          }}
                          className="text-[9px] p-1 border border-gray-200 rounded bg-white outline-none cursor-pointer w-full"
                        >
                          <option value="">Verify</option>
                          <option value="VERIFIED">Verify</option>
                          <option value="REJECTED">Reject</option>
                          <option value="UNDER_REVIEW">Review</option>
                        </select>
                        <Link href={`/dashboard/partners/${partner.id}/edit`} className="p-1 px-2 text-blue-600 hover:bg-blue-50 rounded text-[9px] font-bold flex items-center gap-1">
                          <Eye size={12} /> Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(partner)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Partner"
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
          <span className="text-xs text-gray-500">Showing <span className="font-bold text-[#E32222]">{filteredPartners.length}</span> of {partners.length} partners</span>
          <div className="flex gap-1">
            <button className="p-1 border rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14}/></button>
            <button className="p-1 border rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
