'use client';

import { useEffect, useState } from 'react';
import { Car, DollarSign, Route, Users, UserCheck, TrendingUp, Clock } from 'lucide-react';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { rideService } from '@/services/rideService';
import { userService } from '@/services/userService';
import { partnerService } from '@/services/partnerService';
import { VehicleType, Ride, User, Partner } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/Badge';
import Link from 'next/link';

import { RevenueChart } from '@/components/dashboard/RevenueChart';

interface DashboardStats {
  vehicleTypes: number;
  totalRides: number;
  completedRides: number;
  totalUsers: number;
  totalRiders: number;
  scheduledRides: number;
  totalRevenue: number;
  revenueData?: { date: string; amount: number }[];
  todayRevenue?: number;
  pendingPayouts?: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [vehicleTypesRes, ridesRes, usersRes, partnersRes, scheduledRes] = await Promise.all([
          vehicleTypeService.getAll(),
          rideService.getAll(),
          userService.getAll(),
          partnerService.getAll(),
          rideService.getScheduled(),
        ]);

        const vehicleTypes: VehicleType[] = vehicleTypesRes.data || [];
        const rides: Ride[] = ridesRes.data || [];
        const users: User[] = usersRes.data || [];
        const partners: Partner[] = partnersRes.data || [];
        const scheduledRides: Ride[] = scheduledRes.data || [];

        const completedRides = rides.filter(r => r.status === 'COMPLETED');
        const totalRevenue = completedRides.reduce((sum, r) => sum + (r.commission || 0), 0);

        // Process revenue data for chart (Last 7 days)
        const revenueMap = new Map<string, number>();
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(today.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });

        // Initialize with keeping 0
        last7Days.forEach(date => revenueMap.set(date, 0));

        // Aggregate revenue
        completedRides.forEach(ride => {
          if (ride.createdAt) {
            const date = new Date(ride.createdAt).toISOString().split('T')[0];
            if (revenueMap.has(date)) {
              revenueMap.set(date, (revenueMap.get(date) || 0) + (ride.commission || 0));
            }
          }
        });

        const revenueData = last7Days.map(date => ({
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          amount: revenueMap.get(date) || 0
        }));

        // Calculate today's revenue specifically
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRevenue = revenueMap.get(todayStr) || 0;

        setStats({
          vehicleTypes: vehicleTypes.length,
          totalRides: rides.length,
          completedRides: completedRides.length,
          totalUsers: users.length,
          totalRiders: partners.length,
          scheduledRides: scheduledRides.length,
          totalRevenue,
          revenueData,
          todayRevenue,
          pendingPayouts: 12500, // Mocked for now until PayoutService
        });

        setRecentRides(rides.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  const statCards = [
    { label: 'Vehicle Types', value: stats?.vehicleTypes || 0, icon: Car, color: 'from-red-500 to-red-600', href: '/dashboard/vehicle-types' },
    { label: 'Total Rides', value: stats?.totalRides || 0, icon: Route, color: 'from-gray-700 to-gray-800', href: '/dashboard/rides' },
    { label: 'Completed', value: stats?.completedRides || 0, icon: TrendingUp, color: 'from-green-500 to-green-600', href: '/dashboard/rides' },
    { label: 'Scheduled', value: stats?.scheduledRides || 0, icon: Clock, color: 'from-blue-500 to-blue-600', href: '/dashboard/rides/scheduled' },
    { label: 'Users', value: stats?.totalUsers || 0, icon: Users, color: 'from-gray-600 to-gray-700', href: '/dashboard/users' },
    { label: 'Captains', value: stats?.totalRiders || 0, icon: UserCheck, color: 'from-red-400 to-red-500', href: '/dashboard/partners' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Real-time statistics for the VOGY platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card p-5 block hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl lg:text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Revenue Analytics</h2>
              <p className="text-sm text-gray-500">Income trends over the last 7 days</p>
            </div>
            <select className="text-sm border-gray-200 rounded-lg focus:ring-red-500 focus:border-red-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          {stats?.revenueData ? (
            <RevenueChart data={stats.revenueData} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Loading chart data...
            </div>
          )}
        </div>

        {/* Revenue Summary Card */}
        <div className="card p-6 bg-[#E32222] border-none shadow-xl shadow-red-500/20 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                +12.5% vs last week
              </span>
            </div>
            <p className="text-red-100 text-sm font-bold uppercase tracking-widest mb-1">Total Platform Revenue</p>
            <p className="text-4xl lg:text-5xl font-black">₹{stats?.totalRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-red-100">Today's Revenue</span>
              <span className="font-bold">₹{stats?.todayRevenue?.toLocaleString('en-IN') || '0'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-red-100">Pending Payouts</span>
              <span className="font-bold">₹{stats?.pendingPayouts?.toLocaleString('en-IN') || '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Rides Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Rides</h2>
          <Link href="/dashboard/rides" className="text-orange-500 hover:text-orange-600 font-medium text-sm">
            View All →
          </Link>
        </div>

        {recentRides.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No rides yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-4 px-4 font-bold text-[11px] uppercase tracking-wider text-gray-500">ID</th>
                  <th className="text-left py-4 px-4 font-bold text-[11px] uppercase tracking-wider text-gray-500">User</th>
                  <th className="text-left py-4 px-4 font-bold text-[11px] uppercase tracking-wider text-gray-500">Vehicle</th>
                  <th className="text-left py-4 px-4 font-bold text-[11px] uppercase tracking-wider text-gray-500">Fare</th>
                  <th className="text-left py-4 px-4 font-bold text-[11px] uppercase tracking-wider text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRides.map((ride) => (
                  <tr key={ride.id} className="border-b border-gray-50 hover:bg-red-50/30 transition-colors">
                    <td className="py-4 px-4">
                      <Link href={`/dashboard/rides/${ride.id}`} className="text-red-500 hover:underline font-bold font-mono text-sm">
                        #{ride.id.slice(-8)}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-gray-800 font-medium">{ride.user?.name || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-600">{ride.vehicleType?.displayName || 'N/A'}</td>
                    <td className="py-4 px-4 font-black text-gray-900">₹{Math.round(ride.totalFare || 0)}</td>
                    <td className="py-4 px-4">
                      <StatusBadge status={ride.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
