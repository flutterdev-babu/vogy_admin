import { publicApi, adminApi } from '@/lib/api';
import { ApiResponse, CityCode } from '@/types';

export const cityCodeService = {
  // Public endpoint - for dropdown population
  async getAll(): Promise<ApiResponse<CityCode[]>> {
    const response = await publicApi.get('/city-codes');
    return response.data;
  },

  // Admin endpoints
  async create(code: string, cityName: string): Promise<ApiResponse<CityCode>> {
    const response = await adminApi.post('/city-codes', { code, cityName });
    return response.data;
  },

  async update(id: string, code: string, cityName: string): Promise<ApiResponse<CityCode>> {
    const response = await adminApi.put(`/city-codes/${id}`, { code, cityName });
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await adminApi.delete(`/city-codes/${id}`);
    return response.data;
  },
};
