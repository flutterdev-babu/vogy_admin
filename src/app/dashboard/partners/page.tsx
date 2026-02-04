'use client';

import { useState, useEffect } from 'react';
import { UserCheck, Search, Filter, CheckCircle, XCircle, Clock, Eye, MoreVertical, Phone, Mail, MapPin, Wifi, WifiOff, Car } from 'lucide-react';
import { partnerService } from '@/services/partnerService';
import { Partner, EntityStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import React from 'react';

const statusColors: Record<EntityStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  SUSPENDED: 'bg-red-100 text-red-700 border-red-200',
};

const statusIcons: Record<EntityStatus, React.ComponentType<{ size?: number; className?: string }>> = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  SUSPENDED: XCircle,
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatus | ''>('');
  const [onlineFilter, setOnlineFilter] = useState<string>('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const fetchPartners = async () => {
    try {
      const response = await partnerService.getAll({
        search: search || undefined,
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

  useEffect(() => {
    const debounce = setTimeout(() => fetchPartners(), 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleStatusChange = async (partner: Partner, newStatus: EntityStatus) => {
    try {
      await partnerService.updateStatus(partner.id, newStatus);
      toast.success(`Partner ${newStatus.toLowerCase()}`);
      fetchPartners();
      setSelectedPartner(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update partner status');
    }
  };

  if (isLoading) return <PageLoader />;

  const onlineCount = partners.filter(p => p.isOnline).length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Partners</h1>
          <p className="text-gray-500 mt-1">Manage drivers and delivery partners</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-600 text-sm font-semibold flex items-center gap-1.5">
            <Wifi size={14} />
            {onlineCount} Online
          </span>
          <span className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold">
            {partners.length} Total
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="input pl-11"
            />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EntityStatus | '')}
              className="input pl-11 pr-10 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
          <div className="relative">
            <Wifi size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={onlineFilter}
              onChange={(e) => setOnlineFilter(e.target.value)}
              className="input pl-11 pr-10 appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="">All</option>
              <option value="true">Online</option>
              <option value="false">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Partners Grid */}
      {partners.length === 0 ? (
        <div className="card p-12 text-center">
          <UserCheck size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No partners found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => {
            const StatusIcon = statusIcons[partner.status];
            return (
              <div key={partner.id} className="card p-6 hover:border-orange-300 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                        <UserCheck size={24} className="text-white" />
                      </div>
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${partner.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-500 font-medium">{partner.customId}</p>
                      <h3 className="font-bold text-gray-800">{partner.name}</h3>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setSelectedPartner(selectedPartner?.id === partner.id ? null : partner)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} className="text-gray-500" />
                    </button>
                    {selectedPartner?.id === partner.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 min-w-[140px]">
                        {(['APPROVED', 'PENDING', 'SUSPENDED'] as EntityStatus[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(partner, status)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                          >
                            {React.createElement(statusIcons[status], { size: 14 })}
                            Set {status.charAt(0) + status.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Online Status */}
                <div className={`flex items-center gap-2 mb-3 px-2 py-1 rounded-lg ${partner.isOnline ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                  {partner.isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                  <span className="text-xs font-medium">{partner.isOnline ? 'Currently Online' : 'Offline'}</span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Phone size={14} />
                    <span>{partner.phone}</span>
                  </div>
                  {partner.email && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Mail size={14} />
                      <span className="truncate">{partner.email}</span>
                    </div>
                  )}
                  {partner.cityCode && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin size={14} />
                      <span>{partner.cityCode.cityName}</span>
                    </div>
                  )}
                  {partner.vehicle && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Car size={14} />
                      <span>{partner.vehicle.registrationNumber} - {partner.vehicle.vehicleModel}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[partner.status]}`}>
                    <StatusIcon size={12} />
                    {partner.status}
                  </span>
                  <button className="flex items-center gap-1.5 text-emerald-500 hover:text-emerald-600 text-sm font-medium transition-colors">
                    <Eye size={14} />
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
