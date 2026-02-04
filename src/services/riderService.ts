import api from '@/lib/api';
import { ApiResponse, Rider } from '@/types';

export const riderService = {
  async getAll(): Promise<ApiResponse<Rider[]>> {
    const response = await api.get('/riders');
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Rider>> {
    const response = await api.get(`/riders/${id}`);
    return response.data;
  },
};
