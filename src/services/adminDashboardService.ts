import { adminApi as api } from '@/lib/api';
import { 
  ApiResponse, 
  AdminDashboardData, 
  AdminRevenueAnalytics, 
  AdminRideAnalytics, 
  AdminEntityAnalytics, 
  AdminRecentActivity 
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


};
