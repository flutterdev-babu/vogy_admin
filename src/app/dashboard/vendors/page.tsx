'use client';

import React, { useState, useEffect } from 'react';
import { Car, Search, Filter, CheckCircle, XCircle, Clock, Eye, MoreVertical, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { vendorService } from '@/services/vendorService';
import { Vendor, EntityStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

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

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatus | ''>('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const fetchVendors = async () => {
    try {
      const response = await vendorService.getAll({
        search: search || undefined,
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

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchVendors();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleStatusChange = async (vendor: Vendor, newStatus: EntityStatus) => {
    try {
      await vendorService.updateStatus(vendor.id, newStatus);
      toast.success(`Vendor ${newStatus.toLowerCase()}`);
      fetchVendors();
      setSelectedVendor(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update vendor status');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vendors</h1>
          <p className="text-gray-500 mt-1">Manage fleet owners and vehicle providers</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold">
            {vendors.length} Total
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
              placeholder="Search by name, company, or phone..."
              className="input pl-11"
            />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EntityStatus | '')}
              className="input pl-11 pr-10 appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      {vendors.length === 0 ? (
        <div className="card p-12 text-center">
          <Car size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No vendors found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => {
            const StatusIcon = statusIcons[vendor.status];
            return (
              <div key={vendor.id} className="card p-6 hover:border-orange-300 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                      <Car size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-orange-500 font-medium">{vendor.customId}</p>
                      <h3 className="font-bold text-gray-800">{vendor.name}</h3>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setSelectedVendor(selectedVendor?.id === vendor.id ? null : vendor)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} className="text-gray-500" />
                    </button>
                    {selectedVendor?.id === vendor.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 min-w-[140px]">
                        {(['APPROVED', 'PENDING', 'SUSPENDED'] as EntityStatus[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(vendor, status)}
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

                {/* Company */}
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <Building2 size={14} />
                  <span className="text-sm font-medium">{vendor.companyName}</span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Phone size={14} />
                    <span>{vendor.phone}</span>
                  </div>
                  {vendor.email && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Mail size={14} />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                  {vendor.cityCode && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin size={14} />
                      <span>{vendor.cityCode.cityName} ({vendor.cityCode.code})</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[vendor.status]}`}>
                    <StatusIcon size={12} />
                    {vendor.status}
                  </span>
                  <button className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors">
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
