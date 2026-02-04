'use client';

import { useState, useEffect } from 'react';
import { USER_KEYS } from '@/lib/api';
import { Car, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function VendorDashboard() {
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEYS.vendor);
    if (stored) setVendor(JSON.parse(stored));
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#E32222] to-orange-600 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Welcome, {vendor?.companyName || 'Vendor'}! 🚕</h1>
        <p className="text-white/80">Manage your fleet and drivers efficiently.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Vehicles" value="8" icon={<Car className="text-blue-500" />} />
        <StatCard title="Active Drivers" value="6" icon={<Users className="text-green-500" />} />
        <StatCard title="Today's Earnings" value="₹2,450" icon={<DollarSign className="text-yellow-500" />} />
        <StatCard title="Fleet Efficiency" value="92%" icon={<TrendingUp className="text-purple-500" />} />
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center text-gray-400">
        No recent activity.
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
