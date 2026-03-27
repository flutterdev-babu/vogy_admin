import { adminApi as api } from '@/lib/api';
import { 
  ApiResponse, 
  AdminDashboardData, 
  AdminRevenueAnalytics, 
  AdminRideAnalytics, 
  AdminEntityAnalytics, 
  AdminRecentActivity,
  CancellationAnalytics,
  AuditTimelineItem
} from '@/types';

export const adminDashboardService = {
  async getDashboard(): Promise<ApiResponse<AdminDashboardData>> {
    const response = await api.get('/dashboard');
    return response.data;
  },

  async getRevenueAnalytics(): Promise<ApiResponse<AdminRevenueAnalytics>> {
    const response = await api.get('/analytics/revenue');
    return response.data;
  },

  async getRideAnalytics(): Promise<ApiResponse<AdminRideAnalytics>> {
    const response = await api.get('/analytics/rides');
    return response.data;
  },

  async getEntityAnalytics(): Promise<ApiResponse<AdminEntityAnalytics>> {
    const response = await api.get('/analytics/entities');
    return response.data;
  },

  async getCancellationAnalytics(): Promise<ApiResponse<CancellationAnalytics[]>> {
    const response = await api.get('/analytics/cancellations');
    return response.data;
  },

  async getAuditTimeline(): Promise<ApiResponse<AuditTimelineItem[]>> {
    const response = await api.get('/audit-timeline');
    return response.data;
  },
};
