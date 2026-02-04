import api from '@/lib/api';
import { ApiResponse, User } from '@/types';

export const userService = {
  async getAll(): Promise<ApiResponse<User[]>> {
    const response = await api.get('/users');
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<User>> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async regenerateOtp(id: string): Promise<ApiResponse<User>> {
    const response = await api.post(`/users/${id}/regenerate-otp`);
    return response.data;
  },
};
