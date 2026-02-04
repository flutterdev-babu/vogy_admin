'use client';

import { useState, useEffect } from 'react';
import { USER_KEYS } from '@/lib/api';
import { Briefcase, Users, CreditCard, FileText } from 'lucide-react';

export default function CorporateDashboard() {
  const [corporate, setCorporate] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEYS.corporate);
    if (stored) setCorporate(JSON.parse(stored));
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#E32222] to-blue-600 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Dashboard - {corporate?.companyName || 'Corporate'} 🏢</h1>
        <p className="text-white/80">Manage employee travel and expenses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Bookings" value="2" icon={<Briefcase className="text-blue-500" />} />
        <StatCard title="Employees" value="128" icon={<Users className="text-green-500" />} />
        <StatCard title="Monthly Spend" value="₹45k" icon={<CreditCard className="text-yellow-500" />} />
        <StatCard title="Reports Pending" value="1" icon={<FileText className="text-purple-500" />} />
      </div>

       <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center text-gray-400">
        No recent bookings.
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
