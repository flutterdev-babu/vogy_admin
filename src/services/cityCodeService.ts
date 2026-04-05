import { publicApi, adminApi } from '@/lib/api';
import { ApiResponse, CityCode } from '@/types';

export const cityCodeService = {
  // Public endpoint - for dropdown population (user booking etc.)
  async getAll(): Promise<ApiResponse<CityCode[]>> {
    const response = await publicApi.get('/city-codes');
    return response.data;
  },

  // Admin endpoint - returns all fields including isAvailable
  async getAllAdmin(): Promise<ApiResponse<CityCode[]>> {
    const response = await adminApi.get('/city-codes');
    return response.data;
  },

  // Agent/Admin endpoints for management
  async create(code: string, cityName: string, isAvailable: boolean = true): Promise<ApiResponse<CityCode>> {
    const response = await adminApi.post('/city-codes', { code, cityName, isActive: true, isAvailable });
    return response.data;
  },

  async update(id: string, code: string, cityName: string, isAvailable?: boolean): Promise<ApiResponse<CityCode>> {
    const response = await adminApi.put(`/city-codes/${id}`, { code, cityName, isAvailable });
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await adminApi.delete(`/city-codes/${id}`);
    return response.data;
  },
};
