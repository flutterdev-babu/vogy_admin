import { publicApi } from '@/lib/api';
import { ApiResponse, CityCode } from '@/types';

export const cityCodeService = {
  // Public endpoint - for dropdown population
  async getAll(): Promise<ApiResponse<CityCode[]>> {
    const response = await publicApi.get('/city-codes');
    return response.data;
  },
};
