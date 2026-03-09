import PartnerLocationsMap from '@/components/PartnerLocationsMap';
import { MapPin } from 'lucide-react';

export default function PartnerLocationsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] animate-fade-in -m-6 p-6">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <MapPin className="text-[#E32222]" size={28} />
            Partner Live Locations
          </h1>
          <p className="text-sm text-gray-500 mt-1">Real-time tracking of active partners on the field</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-1">
        <PartnerLocationsMap />
      </div>
    </div>
  );
}
