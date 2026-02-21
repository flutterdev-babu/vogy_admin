'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, MapPin, User, Car, 
  Building2, Calendar, ShieldCheck, Mail, 
  Phone, Hash, Fingerprint, Clock, RotateCcw,
  AlertCircle, CheckCircle2, XCircle, Info, Loader2,
  Link
} from 'lucide-react';
import { attachmentService } from '@/services/attachmentService';
import { Attachment, EntityVerificationStatus, AttachmentStatus } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AttachmentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await attachmentService.getById(id as string);
      if (res.success) {
        setAttachment(res.data);
      } else {
        setError(res.message || 'Attachment not found');
      }
    } catch (err: any) {
      console.error('Failed to fetch attachment:', err);
      setError('Connection failure: Unable to retrieve attachment details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handleUpdate = async (field: 'verificationStatus' | 'status' | 'isAvailableForDuty', value: string) => {
    if (!attachment) return;
    setIsUpdating(true);
    const toastId = toast.loading(`Updating ${field}...`);
    try {
      let res;
      if (field === 'verificationStatus') {
        res = await attachmentService.verify(attachment.id, { status: value as any });
      } else {
        res = await attachmentService.update(attachment.id, { [field]: value } as any);
      }

      if (res.success) {
        toast.success(`${field} updated successfully`, { id: toastId });
        fetchDetails();
      } else {
        toast.error(res.message || 'Update failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Failed to update status', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <PageLoader />;

  if (error || !attachment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-red-50 rounded-[3rem] border border-red-100 max-w-2xl mx-auto shadow-2xl shadow-red-500/10 animate-fade-in">
        <AlertCircle size={64} className="text-[#E32222] mb-6 animate-bounce" />
        <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic mb-3">Governance Alert</h2>
        <p className="text-gray-600 font-bold mb-8">{error || "The requested attachment record could not be securely retrieved."}</p>
        <div className="flex gap-4">
          <button onClick={() => router.back()} className="px-8 py-3 bg-white text-gray-800 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-200 hover:bg-gray-50 shadow-lg">
            Exit Portal
          </button>
          <button onClick={fetchDetails} className="px-8 py-3 bg-[#E32222] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black shadow-lg">
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block italic";
  const valueClass = "text-[11px] font-bold text-gray-800 break-all";
  const cardClass = "bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all";
  const sectionTitle = "text-xs font-black text-gray-900 uppercase tracking-[0.2em] mb-8 pb-4 border-b border-gray-50 flex items-center justify-between";

  return (
    <div className="max-w-[1400px] mx-auto pb-20 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <Link 
            href="/dashboard/attachments"
            className="text-[10px] font-black text-gray-400 hover:text-[#E32222] uppercase tracking-[0.2em] flex items-center gap-2 mb-2 transition-colors group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Governance Dashboard
          </Link>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Record Verification</h1>
        </div>
        
        <button 
          onClick={fetchDetails}
          disabled={isUpdating}
          className="w-12 h-12 bg-[#E32222] text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all shadow-xl shadow-red-500/20 active:scale-90"
        >
          {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <RotateCcw size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Attachment Card */}
        <div className={cardClass}>
          <h2 className={sectionTitle}>
             <span className="flex items-center gap-2 italic"><Hash size={14} className="text-[#E32222]" /> Attachment Details</span>
          </h2>
          <div className="space-y-6">
            <div className="flex justify-between items-start">
               <div>
                  <label className={labelClass}>Attachment ID</label>
                  <p className={valueClass}>{attachment.id.slice(-8).toUpperCase()}</p>
               </div>
               <div>
                  <label className={labelClass}>Unique ID</label>
                  <p className="text-xs font-black text-[#E32222] font-mono tracking-tighter italic">{attachment.customId}</p>
               </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
               <div>
                  <label className={labelClass}>Verified Status</label>
                  <select 
                    value={attachment.verificationStatus}
                    onChange={(e) => handleUpdate('verificationStatus', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[11px] font-bold text-gray-700 outline-none focus:border-blue-500"
                  >
                    <option value="VERIFIED">Verified</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
               </div>
               <div>
                  <label className={labelClass}>Status</label>
                  <select 
                    value={attachment.status}
                    onChange={(e) => handleUpdate('status', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[11px] font-bold text-gray-700 outline-none focus:border-green-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="BANNED">Banned</option>
                  </select>
               </div>
               <div>
                  <label className={labelClass}>Available for Duty</label>
                  <select 
                    defaultValue="NO"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[11px] font-bold text-gray-700 outline-none focus:border-orange-500"
                  >
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
                  </select>
               </div>
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex justify-between text-[9px] font-bold text-gray-400">
                <span className="uppercase">Created Date</span>
                <span>{new Date(attachment.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[9px] font-bold text-gray-400">
                <span className="uppercase">Updated Date</span>
                <span>{new Date(attachment.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Card */}
        <div className={cardClass}>
          <h2 className={sectionTitle}>
             <span className="flex items-center gap-2 italic"><User size={14} className="text-blue-500" /> Partner Details</span>
          </h2>
          <div className="grid grid-cols-1 gap-5">
             <div>
                <label className={labelClass}>Partner Unique ID</label>
                <p className="text-xs font-black text-blue-600 font-mono tracking-tighter italic">{attachment.partner?.customId || 'N/A'}</p>
             </div>
             <div>
                <label className={labelClass}>Full Name</label>
                <p className={valueClass}>{attachment.partner?.name}</p>
             </div>
             <div>
                <label className={labelClass}>Email / Mobile</label>
                <p className={valueClass}>{attachment.partner?.email}</p>
                <p className="text-[10px] font-black text-gray-900 mt-0.5">{attachment.partner?.phone}</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className={labelClass}>Gender</label>
                  <p className={valueClass}>{attachment.partner?.gender || 'MALE'}</p>
               </div>
               <div>
                  <label className={labelClass}>DOB</label>
                  <p className={valueClass}>{attachment.partner?.dateOfBirth || '2000-01-01'}</p>
               </div>
             </div>
             <div>
                <label className={labelClass}>Local Address</label>
                <p className="text-[10px] font-medium text-gray-600 leading-snug">{attachment.partner?.localAddress || 'Bengaluru'}</p>
             </div>
             <div>
                <label className={labelClass}>Permanent Address</label>
                <p className="text-[10px] font-medium text-gray-600 leading-snug">{attachment.partner?.permanentAddress || 'Airport'}</p>
             </div>
          </div>
        </div>

        {/* Vendor Card */}
        <div className={cardClass}>
          <h2 className={sectionTitle}>
             <span className="flex items-center gap-2 italic"><Building2 size={14} className="text-orange-500" /> Vendor Details</span>
          </h2>
          <div className="grid grid-cols-1 gap-4">
             <div className="flex justify-between">
                <div>
                   <label className={labelClass}>Vendor Unique ID</label>
                   <p className="text-[10px] font-black text-orange-600 font-mono italic">{attachment.vendor?.customId || 'ICVVBLR1'}</p>
                </div>
                <div>
                   <label className={labelClass}>GST / PAN</label>
                   <p className="text-[9px] font-black text-gray-900 tracking-tight">{attachment.vendor?.gstNumber || '29AAICE2278B1ZO'}</p>
                   <p className="text-[9px] font-black text-gray-400 tracking-tight">{attachment.vendor?.panNumber || 'AAICE2278B'}</p>
                </div>
             </div>
             <div>
                <label className={labelClass}>Company Name</label>
                <p className="text-[11px] font-black uppercase text-gray-900">{attachment.vendor?.companyName || 'VOGY CAB'}</p>
             </div>
             <div className="grid grid-cols-1 gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                <div>
                   <label className={labelClass}>Primary Email</label>
                   <p className="text-[10px] font-bold text-gray-700">{attachment.vendor?.email || 'saurabh.kumar@vogy.com'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className={labelClass}>CC Mobile</label>
                      <p className="text-[10px] font-black">{attachment.vendor?.ccMobile || '7892392092'}</p>
                   </div>
                   <div>
                      <label className={labelClass}>Office Landline</label>
                      <p className="text-[10px] font-black">{attachment.vendor?.officeLandline || '9113887558'}</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className={labelClass}>Owner Contact</label>
                       <p className="text-[10px] font-black text-red-500">{attachment.vendor?.ownerContact || '9742652879'}</p>
                    </div>
                    <div>
                       <label className={labelClass}>Secondary</label>
                       <p className="text-[10px] font-black">{attachment.vendor?.secondaryNumber || '7272909873'}</p>
                    </div>
                </div>
             </div>
             <div>
                <label className={labelClass}>Office Address</label>
                <p className="text-[9px] font-medium text-gray-500 leading-tight">
                  {attachment.vendor?.officeAddress || '2nd Floor, Hirandahalli Village, ECO Mitra Road, Virgonagar, Bangalore, Karnataka, India 560049'}
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Vehicle Details - Full Width Bottom */}
      <div className={cardClass}>
         <h2 className={sectionTitle}>
            <span className="flex items-center gap-2 italic"><Car size={14} className="text-emerald-500" /> Vehicle Technical Matrix</span>
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
            <div className="space-y-4">
               <div>
                  <label className={labelClass}>Vehicle Unique ID</label>
                  <p className="text-xs font-black text-emerald-600 font-mono italic">{attachment.vehicle?.customId || 'VHBLR01'}</p>
               </div>
               <div>
                  <label className={labelClass}>Visual Matrix (Color / Fuel)</label>
                  <p className={valueClass}>{attachment.vehicle?.color || 'Silver'} / {attachment.vehicle?.fuelType || 'DIESEL'}</p>
               </div>
               <div>
                  <label className={labelClass}>Vehicle Group</label>
                  <p className={valueClass}>{attachment.vehicle?.vehicleType?.displayName || 'Etios (Sedan)'}</p>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <label className={labelClass}>Registration Identity</label>
                  <p className="text-sm font-black text-gray-900 tracking-tighter">{attachment.vehicle?.registrationNumber || 'KA05AB7682'}</p>
               </div>
               <div>
                  <label className={labelClass}>Ownership (Legal Name)</label>
                  <p className={valueClass}>Sunil kumar h</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className={labelClass}>Reg. Date</label>
                     <p className={valueClass}>03/01/2015</p>
                  </div>
                  <div>
                     <label className={labelClass}>Fitness Exp.</label>
                     <p className={valueClass}>14/01/2026</p>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <label className={labelClass}>Model Identity (Year / Capacity)</label>
                  <p className={valueClass}>{attachment.vehicle?.vehicleModel || '2014'} / 4+1 Seats</p>
               </div>
               <div>
                  <label className={labelClass}>Chassis No / Permit Exp</label>
                  <p className="text-[10px] font-mono font-bold text-gray-500">MBJB49BTX000941151214</p>
                  <p className="text-[10px] font-black text-orange-600 mt-1 uppercase italic">Permit: 12/01/2028</p>
               </div>
               <div className="pt-2 px-4 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest block mb-1">Insurance Protocol</span>
                  <p className="text-[10px] font-bold text-emerald-800">Policy: 1003/31/26/350255</p>
                  <p className="text-[9px] font-medium text-emerald-600">Active until 11/01/2026</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
