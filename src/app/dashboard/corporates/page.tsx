'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Search, Filter, CheckCircle, XCircle, Clock, Eye, MoreVertical, Phone, Mail, CreditCard, DollarSign } from 'lucide-react';
import { corporateService } from '@/services/corporateService';
import { Corporate, EntityStatus } from '@/types';
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

export default function CorporatesPage() {
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EntityStatus | ''>('');
  const [selectedCorporate, setSelectedCorporate] = useState<Corporate | null>(null);
  const [editingCreditLimit, setEditingCreditLimit] = useState<string | null>(null);
  const [newCreditLimit, setNewCreditLimit] = useState('');

  const fetchCorporates = async () => {
    try {
      const response = await corporateService.getAll();
      if (response.success) {
        setCorporates(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch corporates:', error);
      toast.error('Failed to load corporates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCorporates();
  }, []);

  const filteredCorporates = corporates.filter(c => {
    const matchesSearch = search === '' || 
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (corporate: Corporate, newStatus: EntityStatus) => {
    try {
      await corporateService.updateStatus(corporate.id, newStatus);
      toast.success(`Corporate ${newStatus.toLowerCase()}`);
      fetchCorporates();
      setSelectedCorporate(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleCreditLimitUpdate = async (corporateId: string) => {
    try {
      await corporateService.updateCreditLimit(corporateId, parseFloat(newCreditLimit));
      toast.success('Credit limit updated');
      fetchCorporates();
      setEditingCreditLimit(null);
      setNewCreditLimit('');
    } catch (error) {
      console.error('Failed to update credit limit:', error);
      toast.error('Failed to update credit limit');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Corporates</h1>
          <p className="text-gray-500 mt-1">Manage business accounts and billing</p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
          {corporates.length} Corporates
        </span>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, contact, or email..."
              className="input pl-11" />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as EntityStatus | '')}
              className="input pl-11 pr-10 appearance-none cursor-pointer min-w-[140px]">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Corporates Grid */}
      {filteredCorporates.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No corporates found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCorporates.map((corporate) => {
            const StatusIcon = statusIcons[corporate.status];
            return (
              <div key={corporate.id} className="card p-6 hover:border-blue-300 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-md">
                      <Building2 size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{corporate.companyName}</h3>
                      <p className="text-sm text-gray-500">{corporate.contactPerson}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button onClick={() => setSelectedCorporate(selectedCorporate?.id === corporate.id ? null : corporate)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical size={18} className="text-gray-500" />
                    </button>
                    {selectedCorporate?.id === corporate.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 min-w-[140px]">
                        {(['APPROVED', 'PENDING', 'SUSPENDED'] as EntityStatus[]).map((status) => (
                          <button key={status} onClick={() => handleStatusChange(corporate, status)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                            {React.createElement(statusIcons[status], { size: 14 })}
                            Set {status.charAt(0) + status.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Mail size={14} /><span className="truncate">{corporate.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Phone size={14} /><span>{corporate.phone}</span>
                  </div>
                  {corporate.gstNumber && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <CreditCard size={14} /><span>{corporate.gstNumber}</span>
                    </div>
                  )}
                </div>

                {/* Credit Limit */}
                <div className="p-3 bg-blue-50 rounded-xl mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">Credit Limit</p>
                      {editingCreditLimit === corporate.id ? (
                        <div className="flex items-center gap-2">
                          <input type="number" value={newCreditLimit} onChange={(e) => setNewCreditLimit(e.target.value)}
                            className="w-24 px-2 py-1 rounded border border-blue-200 text-sm" placeholder="Amount" />
                          <button onClick={() => handleCreditLimitUpdate(corporate.id)}
                            className="text-xs text-blue-600 font-medium">Save</button>
                          <button onClick={() => setEditingCreditLimit(null)}
                            className="text-xs text-gray-500">Cancel</button>
                        </div>
                      ) : (
                        <p className="text-xl font-bold text-gray-800">₹{corporate.creditLimit?.toLocaleString() || 0}</p>
                      )}
                    </div>
                    {editingCreditLimit !== corporate.id && (
                      <button onClick={() => { setEditingCreditLimit(corporate.id); setNewCreditLimit(String(corporate.creditLimit || 0)); }}
                        className="text-blue-500 hover:text-blue-600 text-xs font-medium">Edit</button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[corporate.status]}`}>
                    <StatusIcon size={12} />{corporate.status}
                  </span>
                  <button className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors">
                    <Eye size={14} />View Details
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
