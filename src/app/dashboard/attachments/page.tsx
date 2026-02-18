'use client';

import { useState, useEffect } from 'react';
import { 
  Paperclip, Search, CheckCircle, XCircle, Clock, 
  RotateCcw, ShieldCheck, User, Car, Building2, 
  AlertCircle, ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { attachmentService } from '@/services/attachmentService';
import { Attachment, AttachmentStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const statusColors: Record<AttachmentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-gray-100 text-gray-700',
};

export default function AttachmentsPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AttachmentStatus | ''>('PENDING');
  const [search, setSearch] = useState('');

  const fetchAttachments = async () => {
    setIsLoading(true);
    try {
      const response = await attachmentService.getAll(statusFilter || undefined);
      if (response.success) {
        setAttachments(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
      toast.error('Failed to load attachments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [statusFilter]);

  const handleVerify = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setIsVerifying(id);
    try {
      const res = await attachmentService.verify(id, { status });
      if (res.success) {
        toast.success(`Attachment ${status.toLowerCase()} successfully`);
        fetchAttachments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(null);
    }
  };

  const filteredAttachments = attachments.filter(a => {
    const searchLower = search.toLowerCase();
    return (
      a.partner.name.toLowerCase().includes(searchLower) ||
      a.partner.customId?.toLowerCase().includes(searchLower) ||
      a.vendor.companyName?.toLowerCase().includes(searchLower) ||
      a.vehicle.registrationNumber.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Paperclip size={20} className="text-[#E32222]" /> Attachment Governance
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Verify and manage Partner-Vehicle assignments</p>
        </div>
        <button 
          onClick={fetchAttachments}
          className="p-2 bg-[#E32222] text-white rounded-lg hover:bg-[#cc1f1f] shadow-lg shadow-red-500/20 transition-all active:scale-95"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AttachmentStatus | '')}
          className="text-xs p-2 border border-gray-200 rounded-lg bg-white outline-none min-w-[150px] font-semibold"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Partner, Vehicle or Vendor..." 
            className="w-full text-xs p-2 pl-9 border border-gray-200 rounded-lg bg-white outline-none focus:border-[#E32222]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#E32222] text-white">
              <tr>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Created At</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Partner</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Vehicle Details</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Vendor</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-[100px]">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider w-[200px]">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 italic text-gray-800">
              {filteredAttachments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">No attachments found for this criteria.</td>
                </tr>
              ) : (
                filteredAttachments.map((a) => (
                  <tr key={a.id} className="hover:bg-red-50/20 transition-colors not-italic">
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-700">{new Date(a.createdAt).toLocaleDateString()}</span>
                        <span className="text-[9px] text-gray-400">{new Date(a.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <User size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-gray-800">{a.partner.name}</span>
                          <span className="text-[10px] text-emerald-600 font-mono font-bold tracking-tighter uppercase">{a.partner.customId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Car size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-gray-800 underline underline-offset-2 decoration-emerald-200">{a.vehicle.registrationNumber}</span>
                          <span className="text-[9px] text-gray-500">{a.vehicle.vehicleModel} ({a.vehicle.vehicleType.displayName})</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                       <div className="flex items-center gap-2">
                        <Building2 size={12} className="text-orange-400" />
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium">{a.vendor.companyName || a.vendor.name}</span>
                          <span className="text-[9px] text-orange-500 font-bold font-mono uppercase">{a.vendor.customId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusColors[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {a.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button 
                            disabled={!!isVerifying}
                            onClick={() => handleVerify(a.id, 'APPROVED')}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                          >
                            {isVerifying === a.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                            Approve
                          </button>
                          <button 
                            disabled={!!isVerifying}
                            onClick={() => handleVerify(a.id, 'REJECTED')}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-all shadow-md shadow-red-500/20 disabled:opacity-50"
                          >
                            <XCircle size={12} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 italic">
                          <AlertCircle size={12} /> Action Completed
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-500">Showing <span className="font-bold text-[#E32222]">{filteredAttachments.length}</span> attachments</span>
          <div className="flex gap-1">
            <button className="p-1 border rounded hover:bg-gray-100"><ChevronLeft size={14}/></button>
            <button className="p-1 border rounded hover:bg-gray-100"><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
