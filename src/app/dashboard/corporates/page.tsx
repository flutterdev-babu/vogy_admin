'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Search, Filter, CheckCircle, XCircle, Clock, Eye, MoreVertical, Phone, Mail, CreditCard, DollarSign, RotateCcw } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Corporates</h1>
          <p className="text-sm text-gray-500 font-medium">B2B accounts, credit lines, and billing management</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
            <div className="px-4 py-2 flex flex-col items-center">
              <span className="text-xl font-black text-gray-900 leading-none">{corporates.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Total Accounts</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCorporates}
              className="p-3 bg-white text-gray-600 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              title="Refresh Data"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Filter Section */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px] relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
            <input
              type="text"
              placeholder="Search by company name, contact person, or email..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-gray-200 outline-none transition-all placeholder:text-gray-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EntityStatus | '')}
                className="pl-9 pr-8 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold text-gray-600 appearance-none focus:ring-2 focus:ring-gray-200 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="">Status: All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <button
              onClick={() => { setSearch(''); setStatusFilter(''); }}
              className="px-4 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Company Entity</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Contact Person</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Communication</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Credit Line</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono text-center">Regulatory</th>
                <th className="px-4 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Account Status</th>
                <th className="px-4 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCorporates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-400 font-bold italic">
                    No corporate accounts found
                  </td>
                </tr>
              ) : (
                filteredCorporates.map((corporate) => (
                  <tr key={corporate.id} className="group transition-all duration-200 hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
                          <Building2 size={18} />
                        </div>
                        <span className="text-sm font-black text-gray-900 tracking-tight">{corporate.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[13px] font-black text-gray-800">{corporate.contactPerson}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <Phone size={10} className="text-gray-400" />
                          <span className="text-[10px] font-black text-gray-700 tracking-tight">{corporate.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Mail size={10} className="text-gray-400" />
                          <span className="text-[10px] font-bold text-gray-400 truncate max-w-[160px]">{corporate.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {editingCreditLimit === corporate.id ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <DollarSign size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="number"
                              value={newCreditLimit}
                              onChange={(e) => setNewCreditLimit(e.target.value)}
                              className="w-24 pl-6 pr-2 py-1.5 bg-gray-50 border border-blue-200 rounded-lg text-xs font-bold outline-none"
                              placeholder="0"
                            />
                          </div>
                          <button onClick={() => handleCreditLimitUpdate(corporate.id)} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <CheckCircle size={12} />
                          </button>
                          <button onClick={() => setEditingCreditLimit(null)} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors">
                            <XCircle size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group/edit">
                          <span className="text-sm font-black text-gray-900">₹{corporate.creditLimit?.toLocaleString() || 0}</span>
                          <button
                            onClick={() => { setEditingCreditLimit(corporate.id); setNewCreditLimit(String(corporate.creditLimit || 0)); }}
                            className="p-1 text-blue-500 opacity-0 group-hover/edit:opacity-100 transition-opacity hover:bg-blue-50 rounded"
                          >
                            <CreditCard size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {corporate.gstNumber ? (
                        <div className="inline-flex px-2 py-0.5 bg-green-50 text-green-600 rounded-md border border-green-100">
                          <span className="text-[9px] font-black uppercase tracking-widest">{corporate.gstNumber}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300 font-bold italic">Unset</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border shadow-sm ${statusColors[corporate.status]}`}>
                        {React.createElement(statusIcons[corporate.status], { size: 10 })}
                        <span className="text-[10px] font-black uppercase tracking-widest">{corporate.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right pr-8">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                        <div className="relative group/actions">
                          <button className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-900">
                            <MoreVertical size={16} />
                          </button>
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 hidden group-hover/actions:block z-20">
                            <p className="px-4 py-1 text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Set Account Status</p>
                            {(['APPROVED', 'PENDING', 'SUSPENDED'] as EntityStatus[]).map((status) => (
                              <button key={status} onClick={() => handleStatusChange(corporate, status)} className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between transition-colors">
                                {status}
                                {corporate.status === status && <CheckCircle size={10} className="text-green-500" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-xl transition-all shadow-sm" title="View Full Details">
                          <Eye size={16} />
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
            Showing <span className="text-gray-900 font-black">{filteredCorporates.length}</span> business accounts
          </span>
        </div>
      </div>
    </div>
  );
}
