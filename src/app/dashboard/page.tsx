'use client';

import { useEffect, useState } from 'react';
import { Car, DollarSign, Route, Users, UserCheck, TrendingUp, Clock } from 'lucide-react';
import { vehicleTypeService } from '@/services/vehicleTypeService';
import { rideService } from '@/services/rideService';
import { userService } from '@/services/userService';
import { riderService } from '@/services/riderService';
import { VehicleType, Ride, User, Rider } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/Badge';
import Link from 'next/link';

interface DashboardStats {
  vehicleTypes: number;
  totalRides: number;
  completedRides: number;
  totalUsers: number;
  totalRiders: number;
  scheduledRides: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [vehicleTypesRes, ridesRes, usersRes, ridersRes, scheduledRes] = await Promise.all([
          vehicleTypeService.getAll(),
          rideService.getAll(),
          userService.getAll(),
          riderService.getAll(),
          rideService.getScheduled(),
        ]);

        const vehicleTypes: VehicleType[] = vehicleTypesRes.data || [];
        const rides: Ride[] = ridesRes.data || [];
        const users: User[] = usersRes.data || [];
        const riders: Rider[] = ridersRes.data || [];
        const scheduledRides: Ride[] = scheduledRes.data || [];

        const completedRides = rides.filter(r => r.status === 'COMPLETED');
        const totalRevenue = completedRides.reduce((sum, r) => sum + (r.commission || 0), 0);

        setStats({
          vehicleTypes: vehicleTypes.length,
          totalRides: rides.length,
          completedRides: completedRides.length,
          totalUsers: users.length,
          totalRiders: riders.length,
          scheduledRides: scheduledRides.length,
          totalRevenue,
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
    { label: 'Vehicle Types', value: stats?.vehicleTypes || 0, icon: Car, color: 'from-orange-400 to-orange-600', href: '/dashboard/vehicle-types' },
    { label: 'Total Rides', value: stats?.totalRides || 0, icon: Route, color: 'from-blue-400 to-blue-600', href: '/dashboard/rides' },
    { label: 'Completed', value: stats?.completedRides || 0, icon: TrendingUp, color: 'from-green-400 to-green-600', href: '/dashboard/rides' },
    { label: 'Scheduled', value: stats?.scheduledRides || 0, icon: Clock, color: 'from-purple-400 to-purple-600', href: '/dashboard/rides/scheduled' },
    { label: 'Users', value: stats?.totalUsers || 0, icon: Users, color: 'from-pink-400 to-pink-600', href: '/dashboard/users' },
    { label: 'Captains', value: stats?.totalRiders || 0, icon: UserCheck, color: 'from-indigo-400 to-indigo-600', href: '/dashboard/riders' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here&apos;s an overview of your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card p-3 sm:p-4 lg:p-6 block animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-xs sm:text-sm font-medium truncate">{stat.label}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg lg:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="card p-4 sm:p-6 mb-6 lg:mb-8 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-orange-100 text-xs sm:text-sm font-medium">Total Revenue (Commission)</p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-1">₹{stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg lg:rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
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
                <tr className="border-b border-orange-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Vehicle</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Fare</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRides.map((ride) => (
                  <tr key={ride.id} className="border-b border-gray-50 hover:bg-orange-50/50">
                    <td className="py-3 px-4">
                      <Link href={`/dashboard/rides/${ride.id}`} className="text-orange-500 hover:underline font-mono text-sm">
                        {ride.id.slice(-8)}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{ride.user?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-700">{ride.vehicleType?.displayName || 'N/A'}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">₹{ride.totalFare?.toFixed(2)}</td>
                    <td className="py-3 px-4">
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
