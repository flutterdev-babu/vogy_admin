import { publicApi, adminApi } from '@/lib/api';
import { ApiResponse, CityCode } from '@/types';

export const cityCodeService = {
  // Public endpoint - for dropdown population
  async getAll(): Promise<ApiResponse<CityCode[]>> {
    const response = await publicApi.get('/city-codes');
    return response.data;
  },

  // Agent/Admin endpoints for management
  async create(code: string, cityName: string): Promise<ApiResponse<CityCode>> {
    const response = await publicApi.post('/city-codes', { code, cityName, isActive: true });
    return response.data;
  },

  async update(id: string, code: string, cityName: string): Promise<ApiResponse<CityCode>> {
    const response = await publicApi.put(`/city-codes/${id}`, { code, cityName });
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await publicApi.delete(`/city-codes/${id}`);
    return response.data;
  },
};
