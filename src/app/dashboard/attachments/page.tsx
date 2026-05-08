'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Paperclip, Search, CheckCircle, XCircle, Clock,
  RotateCcw, ShieldCheck, User, Car, Building2,
  AlertCircle, ChevronLeft, ChevronRight, Loader2, Eye, Zap, Shield
} from 'lucide-react';
import { attachmentService } from '@/services/attachmentService';
import { Attachment, AttachmentStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { AdvancedTable } from '@/components/ui/AdvancedTable';
import toast from 'react-hot-toast';

const statusColors: any = {
  PENDING: 'bg-amber-50 text-amber-600 border-amber-100/50',
  VERIFIED: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
  REJECTED: 'bg-red-50 text-red-600 border-red-100/50',
  SUSPENDED: 'bg-gray-50 text-gray-600 border-gray-100/50',
  APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
  UNVERIFIED: 'bg-blue-50 text-blue-600 border-blue-100/50',
};

export default function AttachmentsPage() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AttachmentStatus | ''>('PENDING');

  const fetchAttachments = async () => {
    setIsLoading(true);
    try {
      const response = await attachmentService.getAll(statusFilter || undefined);
      if (response.success) {
        setAttachments(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
      toast.error('Registry access failure');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [statusFilter]);

  const handleVerify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    setIsVerifying(id);
    const toastId = toast.loading(`Processing ${status.toLowerCase()} protocol...`);
    try {
      const res = await attachmentService.verify(id, { status });
      if (res.success) {
        toast.success(`Protocol ${status} executed successfully`, { id: toastId });
        fetchAttachments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Protocol failure', { id: toastId });
    } finally {
      setIsVerifying(null);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            Attachment Governance
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">Verification & Management of Entity-Asset Bindings</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/attachments/create"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-xs shadow-lg shadow-gray-100 transition-all hover:bg-black hover:-translate-y-0.5 active:scale-95"
          >
            <Paperclip size={16} />
            <span>BIND NEW ASSET</span>
          </Link>
          <button
            onClick={fetchAttachments}
            className="p-3 bg-white text-gray-600 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Control Terminal */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200 text-white flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3 text-red-500">
            <Shield size={20} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Verification Filter</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'ALL ENTITIES', value: '' },
              { label: 'PENDING REVIEW', value: 'PENDING' },
              { label: 'VERIFIED', value: 'VERIFIED' },
              { label: 'REJECTED', value: 'REJECTED' },
              { label: 'SUSPENDED', value: 'SUSPENDED' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value as AttachmentStatus | '')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === opt.value
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/40'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="w-px h-16 bg-gray-800 hidden md:block" />
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Registered Bindings</p>
            <p className="text-3xl font-black text-white mt-1">{attachments.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center text-red-500">
            <Zap size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50 mb-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Binding Registry</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Synchronized with fleet database</p>
        </div>

        <AdvancedTable
          data={attachments}
          itemsPerPage={10}
          isLoading={isLoading}
          searchPlaceholder="Search Partner Name, Registration, or Custom ID..."
          columns={[
            {
              header: 'TIMESTAMP',
              accessor: (item: Attachment) => (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-900">{new Date(item.createdAt).toLocaleDateString()}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(item.createdAt).toLocaleTimeString()}</span>
                </div>
              )
            },
            {
              header: 'CAPTAIN ENTITY',
              accessor: (item: Attachment) => (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900 tracking-tight leading-none uppercase">{item.partner?.name || 'Unknown Partner'}</div>
                    <div className="text-[10px] font-bold text-emerald-600 uppercase mt-1.5 tracking-tighter font-mono">
                      {item.partner?.customId || 'N/A'}
                    </div>
                  </div>
                </div>
              )
            },
            {
              header: 'ASSET DETAILS',
              accessor: (item: Attachment) => (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                    <Car size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900 tracking-tight leading-none uppercase font-mono">{item.vehicle?.customId || 'N/A'}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase mt-1.5 tracking-tighter">
                      {item.vehicle?.registrationNumber || 'No Plate'} • {item.vehicle?.vehicleModel || 'No Model'}
                    </div>
                  </div>
                </div>
              )
            },
            {
              header: 'VENDOR AFFILIATION',
              accessor: (item: Attachment) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <Building2 size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-700 uppercase tracking-tighter">{item.vendor?.companyName || item.vendor?.name || 'N/A'}</span>
                    <span className="text-[9px] text-amber-500 font-black font-mono uppercase leading-none">{item.vendor?.customId || 'N/A'}</span>
                  </div>
                </div>
              )
            },
            {
              header: 'SECURITY STATUS',
              accessor: (item: Attachment) => (
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[item.status]}`}>
                  {item.status}
                </span>
              )
            },
            {
              header: 'VERIFICATION PROTOCOL',
              accessor: (item: Attachment) => (
                <div className="flex items-center gap-2">
                  {item.status === 'PENDING' ? (
                    <div className="flex gap-2">
                      <button
                        disabled={!!isVerifying}
                        onClick={() => handleVerify(item.id, 'VERIFIED')}
                        className="px-4 py-2 bg-emerald-600 text-white text-[9px] font-black rounded-xl hover:bg-black transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 uppercase tracking-widest flex items-center gap-2"
                      >
                        {isVerifying === item.id ? <Loader2 size={10} className="animate-spin" /> : <ShieldCheck size={10} />}
                        VERIFY
                      </button>
                      <button
                        disabled={!!isVerifying}
                        onClick={() => handleVerify(item.id, 'REJECTED')}
                        className="p-2 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-100"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase italic">
                      <AlertCircle size={10} />
                      {item.status === 'VERIFIED' ? 'SIGNED' : 'REJECTED'}
                    </div>
                  )}
                  <Link
                    href={`/dashboard/attachments/${item.id}/edit`}
                    className="p-2.5 bg-gray-900 text-white hover:bg-black rounded-xl transition-all shadow-lg shadow-gray-200"
                  >
                    <Eye size={14} />
                  </Link>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}
