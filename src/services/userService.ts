import api from '@/lib/api';
import { ApiResponse, User, CreateUserRequest, UpdateUserRequest } from '@/types';

export const userService = {
  async getAll(): Promise<ApiResponse<User[]>> {
    const response = await api.get('/users');
    return response.data;
  },

  async search(query: string): Promise<ApiResponse<User[]>> {
    const response = await api.get(`/users?search=${encodeURIComponent(query)}`);
    return response.data;
  },

  async createByAdmin(data: CreateUserRequest): Promise<ApiResponse<User>> {
    const response = await api.post('/users', data);
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<User>> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async regenerateOtp(id: string): Promise<ApiResponse<User>> {
    const response = await api.post(`/users/${id}/regenerate-otp`);
    return response.data;
  },
};
