'use client';

import { useState, useEffect } from 'react';
import { USER_KEYS } from '@/lib/api';
import { MapPin, DollarSign, Star, Clock } from 'lucide-react';

export default function PartnerDashboard() {
  const [partner, setPartner] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEYS.partner);
    if (stored) setPartner(JSON.parse(stored));
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#E32222] to-emerald-600 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Hello, {partner?.name || 'Partner'}! 🚗</h1>
        <p className="text-white/80">Ready to drive? Stay safe on the road.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Rides" value="4" icon={<MapPin className="text-blue-500" />} />
        <StatCard title="Earnings" value="₹850" icon={<DollarSign className="text-green-500" />} />
        <StatCard title="Rating" value="4.8" icon={<Star className="text-yellow-500" />} />
        <StatCard title="Online Hours" value="3.5h" icon={<Clock className="text-purple-500" />} />
      </div>

       <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center text-gray-400">
        No assigned rides yet.
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
      </div>
    </div>
  );
}
