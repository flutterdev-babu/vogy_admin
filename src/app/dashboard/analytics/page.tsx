'use client';

import { useEffect, useState } from 'react';
import {
  Car,
  TrendingUp,
  ShieldCheck,
  Activity,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { adminDashboardService } from '@/services/adminDashboardService';
import { AdminDashboardData, AdminRideAnalytics, CancellationAnalytics, AuditTimelineItem } from '@/types';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { VehiclePerformanceChart } from '@/components/dashboard/VehiclePerformanceChart';
import { CancellationChart } from '@/components/dashboard/CancellationChart';
import { SystemHealthTimeline } from '@/components/dashboard/SystemHealthTimeline';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AdminDashboardData | null>(null);
  const [rideAnalytics, setRideAnalytics] = useState<AdminRideAnalytics | null>(null);
  const [cancellationData, setCancellationData] = useState<CancellationAnalytics[]>([]);
  const [auditTimeline, setAuditTimeline] = useState<AuditTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [statsRes, rideAnalyticsRes, cancellationRes, timelineRes] = await Promise.all([
          adminDashboardService.getDashboard(),
          adminDashboardService.getRideAnalytics(),
          adminDashboardService.getCancellationAnalytics(),
          adminDashboardService.getAuditTimeline()
        ]);

        if (statsRes.success) {
          setStats(statsRes.data);
        }

        if (rideAnalyticsRes.success) {
          setRideAnalytics(rideAnalyticsRes.data);
        }

        if (cancellationRes.success) {
          setCancellationData(cancellationRes.data);
        }

        if (timelineRes.success) {
          setAuditTimeline(timelineRes.data);
        }
      } catch (err) {
        console.error('Analytics error:', err);
        setError('An error occurred while loading analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) return <PageLoader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-red-50 rounded-3xl border border-red-100">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Analytics Error</h2>
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

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 uppercase">
            Cognitive Insights
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wider">Advanced algorithmic analytics & system health metrics</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-2xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Engine Active</span>
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vehicle Performance (Pie Chart) */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md group relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Fleet Distribution Metrics</h3>
              <p className="text-lg font-black text-gray-900 tracking-tight uppercase">Vehicle Performance Yield</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
              <Car size={22} />
            </div>
          </div>
          <div className="relative z-10">
            <VehiclePerformanceChart
              data={rideAnalytics?.byVehicleType.map(vt => ({
                name: vt.vehicleType?.displayName || 'Unknown',
                revenue: vt.revenue
              })) || []}
            />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* Cancellation Trends (Bar Chart) */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md group relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Friction Analysis</h3>
              <p className="text-lg font-black text-gray-900 tracking-tight uppercase">Cancellation Trajectory</p>
            </div>
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
              <XCircle size={22} />
            </div>
          </div>
          <div className="relative z-10">
            <CancellationChart data={cancellationData} />
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trends */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm transition-all hover:shadow-md group relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Growth Engine Statistics</h3>
              <p className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Revenue Trajectory Curve</p>
            </div>
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110">
              <TrendingUp size={28} />
            </div>
          </div>
          <div className="relative z-10">
            <RevenueChart
              data={stats?.revenue.todayRevenue ? [
                { date: 'Yesterday', amount: (stats.revenue.total - stats.revenue.todayRevenue) * 0.1 },
                { date: 'Today', amount: stats.revenue.todayRevenue }
              ] : [
                { date: 'Day 1', amount: 0 },
                { date: 'Today', amount: 0 }
              ]}
              color="#10B981"
            />
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* System Health Timeline */}
        <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-md group relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Administrative Audit</h3>
              <p className="text-lg font-black text-gray-900 tracking-tight uppercase">Liveness Protocol</p>
            </div>
            <div className="w-12 h-12 bg-gray-900 text-white rounded-[1.25rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
              <ShieldCheck size={22} />
            </div>
          </div>
          <div className="relative z-10 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
            <SystemHealthTimeline items={auditTimeline} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
        </div>
      </div>
    </div>

  );
}
