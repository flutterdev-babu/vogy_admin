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
  Activity,
  UserPlus
} from 'lucide-react';
import { adminDashboardService } from '@/services/adminDashboardService';
import { AdminDashboardData, AdminRecentActivity } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/Badge';
import Link from 'next/link';


export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardData | null>(null);
  const [activity, setActivity] = useState<AdminRecentActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          adminDashboardService.getDashboard(),
          adminDashboardService.getRecentActivity(10),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (activityRes.success) setActivity(activityRes.data);
        
        if (!statsRes.success) setError(statsRes.message || 'Failed to fetch dashboard statistics');
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError('An error occurred while loading dashboard data');
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
        <h2 className="text-xl font-bold text-gray-800 mb-2">Dashboard Error</h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#E32222] text-white rounded-xl font-medium hover:bg-red-600 transition-colors">
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
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Overview</h1>
        <p className="text-gray-500 mt-1">Global statistics and real-time activity for the platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {entityCards.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-4 block hover:shadow-md transition-all group border border-gray-100">
            <div className="flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider truncate">{stat.label}</p>
                <p className="text-xl font-black text-gray-900 mt-0.5">{stat.value}</p>
                {stat.subValue && <p className="text-[10px] font-bold text-emerald-500 mt-0.5">{stat.subValue}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Top Section: Rides & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ride Stats */}
        <div className="card p-8 bg-white border-none shadow-xl shadow-gray-200/50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Route className="text-[#E32222]" /> Ride Performance
            </h2>
            <div className="px-3 py-1 bg-red-50 text-[#E32222] text-xs font-bold rounded-full">TODAY: {stats?.rides.today || 0}</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <StatSmall label="Total Rides" value={stats?.rides.total || 0} icon={<Activity size={16} />} color="text-gray-800" />
            <StatSmall label="Completed" value={stats?.rides.completed || 0} icon={<TrendingUp size={16} />} color="text-emerald-500" />
            <StatSmall label="Active Now" value={stats?.rides.active || 0} icon={<Clock size={16} />} color="text-orange-500" />
          </div>
        </div>

        {/* Revenue Card */}
        <div className="card p-8 bg-[#E32222] border-none shadow-xl shadow-red-500/20 text-white">
          <div className="flex items-center justify-between mb-8">
            <p className="text-red-100 text-sm font-bold uppercase tracking-widest">Platform Revenue</p>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-4xl lg:text-5xl font-black">₹{stats?.revenue.total.toLocaleString('en-IN') || '0'}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-red-100 text-[10px] font-bold uppercase">Today's Revenue</p>
                <p className="text-lg font-bold">₹{stats?.revenue.todayRevenue.toLocaleString('en-IN') || '0'}</p>
              </div>
              <div>
                <p className="text-red-100 text-[10px] font-bold uppercase">App Commission</p>
                <p className="text-lg font-bold">₹{stats?.revenue.commission.toLocaleString('en-IN') || '0'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Rides */}
        <div className="xl:col-span-2 card p-6 border border-gray-100">
           <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Rides</h2>
            <Link href="/dashboard/rides" className="text-orange-500 hover:text-orange-600 font-medium text-sm">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-4 px-4 font-bold text-[10px] uppercase tracking-wider text-gray-400">Ride ID</th>
                  <th className="text-left py-4 px-4 font-bold text-[10px] uppercase tracking-wider text-gray-400">User</th>
                  <th className="text-left py-4 px-4 font-bold text-[10px] uppercase tracking-wider text-gray-400">Partner</th>
                  <th className="text-left py-4 px-4 font-bold text-[10px] uppercase tracking-wider text-gray-400">Fare</th>
                  <th className="text-left py-4 px-4 font-bold text-[10px] uppercase tracking-wider text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activity?.recentRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="py-4 px-4">
                      <Link href={`/dashboard/rides/${ride.id}`} className="text-[#E32222] hover:underline font-mono text-xs font-bold">{ride.customId || `#${ride.id.slice(-6)}`}</Link>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-800">{ride.user?.name}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{ride.partner?.name || 'Unassigned'}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">₹{ride.totalFare}</td>
                    <td className="py-4 px-4"><StatusBadge status={ride.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Other Recent Entities */}
        <div className="space-y-8">
          <div className="card p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">New Partners</h2>
            <div className="space-y-4">
              {activity?.recentPartners.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{p.customId}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">New Users</h2>
            <div className="space-y-4">
              {activity?.recentUsers.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">{u.name[0]}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatSmall({ label, value, icon, color }: { label: string, value: number | string, icon: React.ReactNode, color: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        {icon}
        <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
