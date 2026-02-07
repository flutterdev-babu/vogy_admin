import { adminApi } from '@/lib/api';
import { ApiResponse, Rider } from '@/types';

/**
 * riderService for backward compatibility.
 * Polyfills the missing module by proxying to the partner endpoints.
 */
export const riderService = {
  /**
   * Fetches all riders (partners) via the admin API.
   */
  async getAll(): Promise<ApiResponse<Rider[]>> {
    const response = await adminApi.get('/partners');
    return response.data;
  },

  /**
   * Fetches a single rider (partner) by ID via the admin API.
   */
  async getById(id: string): Promise<ApiResponse<Rider>> {
    const response = await adminApi.get(`/partners/${id}`);
    return response.data;
  },
};
