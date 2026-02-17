'use client';

import { useState, useEffect } from 'react';
import { vendorService } from '@/services/vendorService';
import { VendorAttachment } from '@/types';
import { Users, Car, Phone, Calendar, UserCheck, ShieldCheck, MoreVertical } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';

export default function VendorDriversPage() {
  const [attachments, setAttachments] = useState<VendorAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const response = await vendorService.getAttachments();
        if (response.success) setAttachments(response.data);
      } catch (err) {
        console.error('Failed to fetch attachments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttachments();
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fleet Drivers</h1>
        <p className="text-gray-500 mt-1">Manage partner assignments and vehicle attachments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {attachments.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E32222]/10 rounded-xl">
                  <UserCheck className="text-[#E32222]" size={20} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {item.status}
                </span>
              </div>
              <button className="p-2 hover:bg-white rounded-xl transition-colors">
                <MoreVertical size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400 text-xl overflow-hidden border-2 border-white shadow-sm">
                  {item.partner.name[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 truncate">{item.partner.name}</h3>
                  <p className="text-xs font-bold text-emerald-600 font-mono">{item.partner.customId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <div>
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Car size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Vehicle</span>
                  </div>
                  <p className="text-xs font-bold text-gray-800 truncate">{item.vehicle.vehicleModel}</p>
                  <p className="text-[10px] font-medium text-gray-500 font-mono">{item.vehicle.registrationNumber}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                    <Phone size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Contact</span>
                  </div>
                  <p className="text-xs font-bold text-gray-800">{item.partner.phone}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-50 italic">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Calendar size={12} />
                  <span className="text-[10px] font-medium">Assigned: {new Date(item.assignedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-500">
                  <ShieldCheck size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

       {attachments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Users size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No drivers or attachments found in your fleet.</p>
        </div>
      )}
    </div>
  );
}
