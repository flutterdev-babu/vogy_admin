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
    role?: 'SUPERADMIN' | 'SUBADMIN',
    secretKey?: string
  ): Promise<ApiResponse<Admin>> {
    const response = await adminApi.post('/auth/register', { name, email, password, role, secretKey });
    return response.data;
  },
};
