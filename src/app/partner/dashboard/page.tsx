'use client';

import { useState, useEffect } from 'react';
import { partnerService } from '@/services/partnerService';
import { PartnerDashboardData, Partner } from '@/types';
import { MapPin, DollarSign, Star, Car, AlertCircle, CheckCircle2, Navigation, Activity } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { OnlineBadge } from '@/components/ui/Badge';
import { USER_KEYS } from '@/lib/api';

export default function PartnerDashboard() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [stats, setStats] = useState<PartnerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEYS.partner);
    if (stored) setPartner(JSON.parse(stored));

    const fetchDashboardData = async () => {
      try {
        const response = await partnerService.getDashboard();
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

  const handleToggleOnline = async () => {
    if (!stats) return;
    try {
      const newStatus = !stats.status.isOnline;
      const res = await partnerService.toggleOnlineStatus(newStatus);
      if (res.success) {
        setStats({
          ...stats,
          status: { ...stats.status, isOnline: newStatus }
        });
      }
    } catch (err) {
      console.error('Failed to toggle online status', err);
    }
  };

  if (isLoading) return <PageLoader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-red-50 rounded-3xl border border-red-100">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#E32222] text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-[#E32222] to-emerald-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hello, {partner?.name || 'Partner'}! 🚗</h1>
          <p className="text-white/80">Ready to drive? Stay safe on the road.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Current Status</p>
            <p className="text-lg font-bold">{stats?.status.isOnline ? 'ONLINE' : 'OFFLINE'}</p>
          </div>
          <button 
            onClick={handleToggleOnline}
            className={`w-14 h-8 rounded-full transition-colors relative ${stats?.status.isOnline ? 'bg-emerald-400' : 'bg-gray-400'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${stats?.status.isOnline ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Rides" 
          value={stats?.rides.today.toString() || '0'} 
          icon={<MapPin className="text-blue-500" />}
          footer={`Total: ${stats?.rides.total || 0}`}
        />
        <StatCard 
          title="Today's Earnings" 
          value={`₹${stats?.earnings.todayEarnings.toLocaleString('en-IN') || '0'}`} 
          icon={<DollarSign className="text-emerald-500" />}
          footer={`Total: ₹${stats?.earnings.total.toLocaleString('en-IN') || '0'}`}
        />
        <StatCard 
          title="Rating" 
          value={stats?.status.rating.toFixed(1) || '0.0'} 
          icon={<Star className="text-amber-500" />}
          footer={`${stats?.rides.completionRate}% Completion`}
        />
        <StatCard 
          title="Active Rides" 
          value={stats?.rides.active.toString() || '0'} 
          icon={<Activity className="text-orange-500" />}
          footer={`${stats?.rides.cancelled || 0} Cancelled`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Car className="text-emerald-500" /> Assigned Vehicle
            </h2>
            {stats?.assignedVehicle ? (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-48 h-32 bg-gray-50 rounded-2xl flex items-center justify-center">
                   <Car size={64} className="text-gray-300" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Model</p>
                    <p className="text-lg font-bold text-gray-800">{stats.assignedVehicle.vehicleModel}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Registration</p>
                    <p className="text-lg font-bold text-gray-800">{stats.assignedVehicle.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Category</p>
                    <p className="text-lg font-bold text-gray-800">{stats.assignedVehicle.vehicleType.displayName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Custom ID</p>
                    <p className="text-lg font-bold text-emerald-600">{stats.assignedVehicle.customId}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Car size={48} className="mx-auto mb-2 opacity-50" />
                <p>No vehicle assigned to you yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Navigation className="text-blue-500" /> Recent Session
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Session Earnings</span>
                <span className="font-bold text-gray-800 text-lg">₹{stats?.earnings.sessionEarnings.toLocaleString('en-IN') || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Gross Fare</span>
                <span className="font-medium text-gray-600">₹{stats?.earnings.totalFare.toLocaleString('en-IN') || '0'}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-emerald-600">
                <span className="font-bold">Today's Total</span>
                <span className="font-black text-2xl">₹{stats?.earnings.todayEarnings.toLocaleString('en-IN') || '0'}</span>
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
  footer 
}: { 
  title: string, 
  value: string, 
  icon: React.ReactNode,
  footer: string
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
      <div className="pt-4 border-t border-gray-50">
        <p className="text-xs font-bold text-gray-400 uppercase">{footer}</p>
      </div>
    </div>
  );
}
