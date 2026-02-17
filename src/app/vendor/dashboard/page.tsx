'use client';

import { useState, useEffect } from 'react';
import { vendorService } from '@/services/vendorService';
import { VendorDashboardData, Vendor } from '@/types';
import { Car, Users, DollarSign, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { USER_KEYS } from '@/lib/api';

export default function VendorDashboard() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [stats, setStats] = useState<VendorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEYS.vendor);
    if (stored) setVendor(JSON.parse(stored));

    const fetchDashboardData = async () => {
      try {
        const response = await vendorService.getDashboard();
        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.message || 'Failed to fetch dashboard data');
        }
      } catch (err: any) {
        setError('An error occurred while loading dashboard statistics');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <PageLoader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-red-50 rounded-3xl border border-red-100">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-[#E32222] to-orange-600 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Welcome, {vendor?.companyName || 'Vendor'}! 🚕</h1>
        <p className="text-white/80">Manage your fleet and drivers efficiently from your central command.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Vehicles" 
          value={stats?.vehicles.total.toString() || '0'} 
          icon={<Car className="text-blue-500" />}
          subStats={[
            { label: 'Available', value: stats?.vehicles.available.toString() || '0', color: 'text-green-500' },
            { label: 'In Use', value: stats?.vehicles.inUse.toString() || '0', color: 'text-blue-500' }
          ]}
        />
        <StatCard 
          title="Partners" 
          value={stats?.partners.total.toString() || '0'} 
          icon={<Users className="text-emerald-500" />}
          subStats={[
            { label: 'Online', value: stats?.partners.online.toString() || '0', color: 'text-emerald-500' },
            { label: 'Offline', value: stats?.partners.offline.toString() || '0', color: 'text-gray-400' }
          ]}
        />
        <StatCard 
          title="Today's Rides" 
          value={stats?.rides.today.toString() || '0'} 
          icon={<TrendingUp className="text-purple-500" />}
          subStats={[
            { label: 'Total', value: stats?.rides.total.toString() || '0', color: 'text-gray-500' },
            { label: 'Active', value: stats?.rides.active.toString() || '0', color: 'text-orange-500' }
          ]}
        />
        <StatCard 
          title="Today's Earnings" 
          value={`₹${stats?.revenue.today.toLocaleString('en-IN') || '0'}`} 
          icon={<DollarSign className="text-amber-500" />}
          subStats={[
            { label: 'Total Revenue', value: `₹${stats?.revenue.total.toLocaleString('en-IN') || '0'}`, color: 'text-gray-500' }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-green-500" /> Ride Performance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.rides.completed || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-500 mb-1">Cancelled</p>
                <p className="text-2xl font-bold text-gray-800">{stats?.rides.cancelled || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-500 mb-1">Active Now</p>
                <p className="text-2xl font-bold text-orange-500">{stats?.rides.active || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="text-blue-500" /> Recent Earnings
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Your Share</span>
                <span className="font-bold text-gray-800 text-lg">₹{stats?.revenue.earnings.toLocaleString('en-IN') || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Ara Travels Commission</span>
                <span className="font-medium text-gray-600">₹{stats?.revenue.commission.toLocaleString('en-IN') || '0'}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-800">Total Gross</span>
                <span className="font-black text-2xl text-[#E32222]">₹{stats?.revenue.total.toLocaleString('en-IN') || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  subStats 
}: { 
  title: string, 
  value: string, 
  icon: React.ReactNode,
  subStats?: Array<{ label: string, value: string, color: string }>
}) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-black text-gray-800 mt-1">{value}</h3>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl">{icon}</div>
      </div>
      {subStats && (
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-50">
          {subStats.map((stat, i) => (
            <div key={i}>
              <p className="text-[10px] text-gray-400 uppercase font-bold">{stat.label}</p>
              <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
