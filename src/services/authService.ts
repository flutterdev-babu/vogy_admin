import adminApi from '@/lib/api';
import { ApiResponse, Admin, LoginResponse } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await adminApi.post('/auth/login', { email, password });
    return response.data;
  },

  async register(
    name: string,
    email: string,
    password: string,
    role?: 'SUPERADMIN' | 'SUBADMIN'
  ): Promise<ApiResponse<Admin>> {
    const response = await adminApi.post('/auth/register', { name, email, password, role });
    return response.data;
  },
};
