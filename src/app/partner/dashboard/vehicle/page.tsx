'use client';

import { useState, useEffect } from 'react';
import { partnerService } from '@/services/partnerService';
import { PartnerVehicleData } from '@/types';
import { Car, ShieldCheck, Calendar, Info, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
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
          {currentVehicle.status || 'Active'}
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
              <SpecItem label="Vehicle Category" value={currentVehicle.vehicleType?.category?.replace('_', ' ') || 'General'} />
              <SpecItem label="Custom Fleet ID" value={currentVehicle.customId || 'N/A'} highlight={true} />
              <SpecItem label="Owner/Vendor" value={currentVehicle.vendor?.companyName || 'Ara Travels Fleet Management'} />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" /> Maintenance & Safety
            </h2>
            <div className="space-y-4">
              <MaintenanceItem label="Last Service" date="Oct 12, 2023" status="Completed" />
              <MaintenanceItem label="Insurance Renewal" date="Dec 24, 2023" status="Upcoming" warning={true} />
              <MaintenanceItem label="Pollution Check" date="Jan 05, 2024" status="Valid" />
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
              <FileText className="text-gray-400" /> Documents
            </h2>
            <div className="space-y-3">
              <DocLink label="Registration Certificate" />
              <DocLink label="Insurance Policy" />
              <DocLink label="Pollution Certificate" />
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

function DocLink({ label }: { label: string }) {
  return (
    <button className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-50 rounded-xl transition-colors group">
      <span className="text-xs font-bold text-gray-600">{label}</span>
      <ArrowUpRight size={14} className="text-gray-300 group-hover:text-[#E32222] transition-colors" />
    </button>
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
