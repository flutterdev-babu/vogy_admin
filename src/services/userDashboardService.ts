import { publicApi as api } from '@/lib/api';
import { 
  ApiResponse, 
  UserRideSummary, 
  UserActiveRide, 
  UserSpendSummary 
} from '@/types';

export const userDashboardService = {
  async getRideSummary(): Promise<ApiResponse<UserRideSummary>> {
    const response = await api.get('/user/rides/summary');
    return response.data;
  },

  async getActiveRide(): Promise<ApiResponse<UserActiveRide | null>> {
    const response = await api.get('/user/rides/active');
    return response.data;
  },

  async getSpendSummary(): Promise<ApiResponse<UserSpendSummary>> {
    const response = await api.get('/user/spend-summary');
    return response.data;
  },
};
