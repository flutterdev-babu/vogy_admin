'use client';

import { useState, useEffect } from 'react';
import { partnerService } from '@/services/partnerService';
import { PartnerVehicleData } from '@/types';
import { Car, ShieldCheck, Calendar, Info, AlertCircle, FileText, CheckCircle2, ExternalLink } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function PartnerVehiclePage() {
  const [vehicle, setVehicle] = useState<PartnerVehicleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await partnerService.getVehicle();
        if (response.success) setVehicle(response.data);
      } catch (err) {
        console.error('Failed to fetch vehicle:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicle();
  }, []);

  if (isLoading) return <PageLoader />;

  if (!vehicle || (!vehicle.assignedVehicle && !vehicle.ownVehicle)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <Car size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">No Vehicle Assigned</h2>
        <p className="text-gray-500 max-w-md">You don't have a vehicle assigned to you at the moment. Please contact your vendor or administrator.</p>
      </div>
    );
  }

  const currentVehicle = (vehicle.assignedVehicle || vehicle.ownVehicle) as any;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{currentVehicle.vehicleModel}</h1>
          <p className="text-gray-400">
            {currentVehicle.vehicleType?.displayName || 'Standard'} • {currentVehicle.registrationNumber}
          </p>
        </div>
        <div className="px-6 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl text-sm font-black tracking-widest uppercase">
          {currentVehicle.verificationStatus || currentVehicle.status || 'Active'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              <Info className="text-blue-500" /> Vehicle Specification
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SpecItem label="Vehicle Model" value={currentVehicle.vehicleModel} />
              <SpecItem label="Registration Number" value={currentVehicle.registrationNumber} />
              <SpecItem label="Vehicle Type" value={currentVehicle.vehicleType?.displayName || 'Standard'} />
              <SpecItem label="Owner/Vendor" value={currentVehicle.vendor?.companyName || 'Ara Travels Fleet Management'} />
              <SpecItem label="RC Number" value={currentVehicle.rcNumber || 'N/A'} highlight={true} />
              <SpecItem label="Chassis Number" value={currentVehicle.chassisNumber || 'N/A'} highlight={true} />
              <SpecItem label="Custom Fleet ID" value={currentVehicle.customId || 'N/A'} />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" /> Maintenance & Safety
            </h2>
            <div className="space-y-4">
              {currentVehicle.insuranceNumber && currentVehicle.insuranceExpiryDate && (
                <MaintenanceItem 
                  label="Insurance Renewal" 
                  date={new Date(currentVehicle.insuranceExpiryDate).toLocaleDateString()} 
                  status="Active" 
                  warning={new Date(currentVehicle.insuranceExpiryDate) < new Date(Date.now() + 30*24*60*60*1000)} 
                />
              )}
              {(!currentVehicle.insuranceNumber || !currentVehicle.insuranceExpiryDate) && (
                <MaintenanceItem label="Insurance Policy" date="Not Available" status="Missing" warning={true} />
              )}
              <MaintenanceItem label="Pollution Check (PUC)" date="Check Documents" status="Unknown" warning={true} />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#E32222] rounded-3xl p-8 text-white shadow-xl shadow-red-500/20">
            <ShieldCheck className="w-12 h-12 mb-6 opacity-80" />
            <h3 className="text-xl font-bold mb-4">Driver Guidelines</h3>
            <ul className="space-y-4 text-sm text-red-100">
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                Always keep the RC book copy in the vehicle.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                Ensure the vehicle is clean before starting shifts.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                Report any abnormal noises immediately.
              </li>
              <li className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                Verification stickers must be visible.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="text-gray-400" /> Documents & Images
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {currentVehicle.rcPhoto && <DocumentThumbnail label="RC Book" url={currentVehicle.rcPhoto} />}
              {currentVehicle.insurancePhoto && <DocumentThumbnail label="Insurance Policy" url={currentVehicle.insurancePhoto} />}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-3">All Attachments</h3>
              {currentVehicle.attachments?.length > 0 ? (
                currentVehicle.attachments.map((doc: any) => (
                  <DocLink key={doc.id} label={doc.fileType?.replace(/_/g, ' ') || 'Document'} url={doc.fileUrl} status={doc.verificationStatus} />
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No additional documents uploaded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ label, value, highlight }: any) {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-emerald-600 font-mono' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}

function MaintenanceItem({ label, date, status, warning }: any) {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
      <div>
        <p className="text-sm font-bold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
      <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${warning ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
        {status}
      </div>
    </div>
  );
}

function DocLink({ label, url, status }: { label: string; url?: string; status?: string }) {
  return (
    <a href={url || '#'} target="_blank" rel="noopener noreferrer" className="w-full flex justify-between items-center p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group border border-gray-100">
      <div>
        <span className="text-xs font-bold text-gray-700 block mb-0.5 capitalize">{label}</span>
        {status && <span className={`text-[9px] font-bold uppercase tracking-widest ${status === 'VERIFIED' ? 'text-emerald-500' : 'text-orange-500'}`}>{status}</span>}
      </div>
      <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#E32222] transition-colors" />
    </a>
  );
}

function ArrowUpRight({ size, className }: any) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function DocumentThumbnail({ label, url }: { label: string; url?: string }) {
  if (!url) return null;
  return (
    <div className="mt-3">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label} Image</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="block relative h-32 rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-500 transition-colors group bg-gray-50 flex items-center justify-center">
        <img src={url} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-xs font-bold px-3 py-1.5 bg-black/50 rounded-md flex items-center gap-1">
            <ExternalLink size={14} /> View
          </span>
        </div>
      </a>
    </div>
  );
}
