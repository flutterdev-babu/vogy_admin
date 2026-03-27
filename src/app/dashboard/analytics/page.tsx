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
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Insights</h1>
        <p className="text-gray-500 mt-1">Advanced financial analytics and system health monitoring.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vehicle Performance (Pie Chart) */}
        <div className="card p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Vehicle Performance</h3>
              <p className="text-sm text-gray-500">Revenue distribution by vehicle type</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <VehiclePerformanceChart 
            data={rideAnalytics?.byVehicleType.map(vt => ({
              name: vt.vehicleType?.displayName || 'Unknown',
              revenue: vt.revenue
            })) || []} 
          />
        </div>

        {/* Cancellation Trends (Bar Chart) */}
        <div className="card p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Cancellation Trends</h3>
              <p className="text-sm text-gray-500">Daily cancellations over the last 7 days</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <CancellationChart data={cancellationData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trends */}
        <div className="lg:col-span-2 card p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Revenue Trends</h3>
              <p className="text-sm text-gray-500">Daily revenue growth curve</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
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

        {/* System Health Timeline */}
        <div className="card p-6 bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">System Health</h3>
              <p className="text-sm text-gray-500">Recent administrative actions</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <SystemHealthTimeline items={auditTimeline} />
          </div>
        </div>
      </div>
    </div>
  );
}
