'use client';

import { useEffect, useState } from 'react';
import { 
  Car, 
  DollarSign, 
  Route, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Briefcase, 
  AlertCircle,
  UserPlus,
  Zap,
  Loader2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Navigation,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';
import { adminDashboardService } from '@/services/adminDashboardService';
import { adminApi } from '@/lib/api';
import { AdminDashboardData, AdminRideAnalytics, CancellationAnalytics, AuditTimelineItem } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { DashboardSkeleton } from '@/components/ui/Skeletons';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PartnerLocationsMap from '@/components/PartnerLocationsMap';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const getStatusConfig = (status: string) => {
  const s = status.toUpperCase();
  switch (s) {
    case 'COMPLETED': return { icon: CheckCircle2, bg: 'bg-emerald-500/10', color: 'text-emerald-500', border: 'border-emerald-100' };
    case 'CANCELLED': return { icon: XCircle, bg: 'bg-red-500/10', color: 'text-red-500', border: 'border-red-100' };
    case 'ONGOING': return { icon: Navigation, bg: 'bg-blue-500/10', color: 'text-blue-500', border: 'border-blue-100' };
    case 'STARTED':
    case 'ARRIVED': return { icon: MapPin, bg: 'bg-indigo-500/10', color: 'text-indigo-500', border: 'border-indigo-100' };
    case 'ASSIGNED': return { icon: UserCheck, bg: 'bg-teal-500/10', color: 'text-teal-500', border: 'border-teal-100' };
    case 'UPCOMING':
    case 'REQUESTED': return { icon: Calendar, bg: 'bg-amber-500/10', color: 'text-amber-500', border: 'border-amber-100' };
    default: return { icon: Activity, bg: 'bg-gray-500/10', color: 'text-gray-500', border: 'border-gray-200' };
  }
};

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardData | null>(null);
  const [rideAnalytics, setRideAnalytics] = useState<AdminRideAnalytics | null>(null);
  const [cancellations, setCancellations] = useState<CancellationAnalytics[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutomating, setIsAutomating] = useState(false);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  const handleAutomation = async () => {
    setIsAutomating(true);
    const toastId = toast.loading('Starting Automation...');

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL;
      if (!baseURL) throw new Error("CRITICAL: NEXT_PUBLIC_API_URL is not defined");
      const token = localStorage.getItem('admin_token');

      if (!token) throw new Error('No admin token found. Please login again.');

      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      toast.loading('Fetching Lookups...', { id: toastId });

      const [cityRes, vtRes] = await Promise.all([
        adminApi.get(`/city-codes`),
        adminApi.get(`/vehicle-types`)
      ]);

      const cities = cityRes.data.data;
      const vts = vtRes.data.data;

      const blrCity = cities.find((c: any) => c.code === 'BLR');
      const sedanType = vts.find((t: any) => 
        t.name?.includes('SEDAN') || t.displayName?.includes('Sedan')
      );

      if (!blrCity) throw new Error('BLR City Code not found');
      if (!sedanType) throw new Error('Sedan Vehicle Type not found');

      toast.loading('Registering Partner...', { id: toastId });

      const pRegRes = await adminApi.post(`/partners`, {
        firstName: "Kiran",
        lastName: "Perepalle",
        name: "Kiran Perepalle",
        phone: "+91" + Math.floor(7000000000 + Math.random() * 2000000000),
        password: "Password@123",
        cityCodeId: blrCity.id,
        gender: "MALE",
        dateOfBirth: "1990-01-01",
        localAddress: "Bangalore, India",
        hasLicense: true,
        licenseNumber: "KA01" + Math.floor(1000000000 + Math.random() * 9000000000),
        licenseImage: "https://via.placeholder.com/600x400?text=Driving+License"
      });

      const partner = pRegRes.data.data;

      toast.loading('Registering Vehicle...', { id: toastId });

      const vRegRes = await adminApi.post(`/vehicles`, {
        registrationNumber: "KA01" + Math.floor(1000 + Math.random() * 9000),
        vehicleModel: "Toyota Etios",
        vehicleTypeId: sedanType.id,
        cityCodeId: blrCity.id,
        fuelType: "PETROL",
        rcImage: "https://via.placeholder.com/600x400?text=Registration+Certificate"
      });

      const vehicle = vRegRes.data.data;

      toast.loading('Registering Vendor...', { id: toastId });

      const vnRegRes = await adminApi.post(`/vendors`, {
        name: "Raju Kumar",
        companyName: "Raju Travels",
        phone: "+91" + Math.floor(7000000000 + Math.random() * 2000000000),
        password: "Password@123",
        cityCodeId: blrCity.id,
        address: "Bangalore, India"
      });

      const vendor = vnRegRes.data.data;

      toast.loading('Creating Attachment...', { id: toastId });

      await adminApi.post(`/attachments`, {
        partnerCustomId: partner.customId,
        vehicleCustomId: vehicle.customId,
        vendorCustomId: vendor.customId,
        cityCode: blrCity.code
      });

      toast.success('Automation Completed Successfully!', { id: toastId });
      window.location.reload();
    } catch (err: any) {
      console.error('Automation failed:', err);
      toast.error(err.message || 'Automation failed', { id: toastId });
    } finally {
      setIsAutomating(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [statsRes, rideAnalyticsRes, cancelRes] = await Promise.all([
        adminDashboardService.getDashboard(),
        adminDashboardService.getRideAnalytics(),
        adminDashboardService.getCancellationAnalytics()
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      } else {
        setError(statsRes.message || 'Failed to fetch dashboard statistics');
      }
      
      if (rideAnalyticsRes.success) {
        setRideAnalytics(rideAnalyticsRes.data);
      }

      if (cancelRes?.success) {
        setCancellations(cancelRes.data);
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('An error occurred while loading dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    let intervalId: NodeJS.Timeout;
    if (isAutoRefresh) {
      intervalId = setInterval(fetchDashboardData, 30000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoRefresh]);

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-red-50 rounded-3xl border border-red-100">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Dashboard Error</h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#E32222] text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const entityCards = [
    { label: 'Total Users', value: stats?.entities.users || 0, icon: Users, color: 'from-blue-500 to-blue-600', href: '/dashboard/users' },
    { label: 'Partners', value: stats?.entities.partners || 0, icon: UserCheck, color: 'from-emerald-500 to-emerald-600', href: '/dashboard/partners', subValue: `${stats?.entities.onlinePartners || 0} Online` },
    { label: 'Vehicles', value: stats?.entities.vehicles || 0, icon: Car, color: 'from-purple-500 to-purple-600', href: '/dashboard/vehicles' },
    { label: 'Vendors', value: stats?.entities.vendors || 0, icon: ShieldCheck, color: 'from-orange-500 to-orange-600', href: '/dashboard/vendors' },
    { label: 'Corporates', value: stats?.entities.corporates || 0, icon: Briefcase, color: 'from-gray-700 to-gray-800', href: '/dashboard/corporates' },
    { label: 'Agents', value: stats?.entities.agents || 0, icon: UserPlus, color: 'from-pink-500 to-pink-600', href: '/dashboard/agents' },
  ];

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Overview</h1>
            <p className="text-gray-500 mt-1">Global statistics overview for the platform.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#E32222] transition-colors shadow-sm"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm mr-2 cursor-pointer transition-all hover:border-gray-200" onClick={() => setIsAutoRefresh(!isAutoRefresh)}>
            <div className={`relative flex items-center px-0.5 w-10 h-5 rounded-full transition-colors ${isAutoRefresh ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isAutoRefresh ? 'translate-x-[20px]' : 'translate-x-0'}`} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Auto-Refresh {isAutoRefresh && '(30s)'}</span>
          </div>

          <Link
            href="/dashboard/rides/manual"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 text-xs italic uppercase"
          >
            <Route size={14} className="text-[#E32222]" />
            Manual Dispatch
          </Link>

          <button
            onClick={handleAutomation}
            disabled={isAutomating}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg text-xs italic uppercase ${
              isAutomating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-[#E32222] text-white hover:scale-105 active:scale-95 shadow-red-500/20'
            }`}
          >
            {isAutomating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-current" />
            )}
            {isAutomating ? 'Running Automation...' : 'Automation'}
          </button>
        </div>
      </div>

      {/* Entity Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {entityCards.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-4 block hover:shadow-md transition-all group border border-gray-100">
            <div className="flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider truncate">{stat.label}</p>
                <p className="text-xl font-black text-gray-900 mt-0.5">{stat.value}</p>
                {stat.subValue && <p className="text-[10px] font-bold text-emerald-500 mt-0.5">{stat.subValue}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Ride Analytics Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Booking Analytics</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time status of all rides in the system</p>
          </div>
          <Link href="/dashboard/rides" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-xl hover:bg-gray-50 hover:text-[#E32222] transition-colors shadow-sm">
            View All Bookings
            <TrendingUp size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {/* Total Rides */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 group shadow-xl">
            <div className="absolute -right-6 -top-6 text-white/5 group-hover:scale-110 transition-transform duration-500">
              <Route size={120} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Route className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Bookings</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-white">{stats?.rides.total || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Rides */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-[#E32222] to-red-700 border border-red-800 group shadow-xl shadow-red-500/20">
            <div className="absolute -right-6 -top-6 text-white/10 group-hover:scale-110 transition-transform duration-500">
              <Zap size={120} />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-100 uppercase tracking-wider mb-1">Active Now</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-white">{stats?.rides.active || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Statuses */}
          {rideAnalytics?.statusDistribution?.map((stat) => {
            const config = getStatusConfig(stat.status);
            const Icon = config.icon;
            return (
              <div key={stat.status} className={`relative overflow-hidden p-6 rounded-2xl bg-white border ${config.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}>
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${config.bg} opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.status}</p>
                    <div className="flex items-baseline justify-between focus:ring-0">
                      <p className="text-3xl font-black text-gray-900">{stat.count}</p>
                      {stats?.rides.total && stats.rides.total > 0 ? (
                        <span className={`text-[10px] font-bold ${config.color} bg-white px-2 py-0.5 rounded-full border ${config.border}`}>
                          {Math.round((stat.count / stats.rides.total) * 100)}%
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6">
        {/* Cancellations Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Cancellation Insights</h2>
          <p className="text-xs text-gray-500 mb-6">Breakdown of unfulfilled or aborted rides</p>
          <div className="flex-1 w-full min-h-[300px]">
            {cancellations && cancellations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cancellations}
                    dataKey="count"
                    nameKey="reason"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {cancellations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#64748b'][index % 5]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <span className="text-sm font-medium">No cancellations recorded.</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Map Panel (HIDDEN FOR NOW) */}
        {/* <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between z-10 bg-white relative">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Navigation size={18} className="text-[#E32222]" />
                Global Live Map
              </h2>
              <p className="text-xs text-gray-500">Real-time GPS tracking of active dispatch nodes.</p>
            </div>
            <div className="flex items-center gap-2">
               <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Live Sync</span>
            </div>
          </div>
          <div className="flex-1 w-full relative -mt-[1px]">
            <PartnerLocationsMap />
          </div>
        </div> */}
      </div>
    </div>
  );
}