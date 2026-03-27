import { adminApi } from '@/lib/api';
import { ApiResponse, Admin, PermissionOption } from '@/types';

export interface CreateAdminRequest {
    name: string;
    email: string;
    password?: string;
    role: 'SUPERADMIN' | 'SUBADMIN';
    permissions: string[];
}

export const adminManagementService = {
    async getAllAdmins(): Promise<ApiResponse<Admin[]>> {
        const response = await adminApi.get('/admins');
        return response.data;
    },

    async getAdminById(id: string): Promise<ApiResponse<Admin>> {
        const response = await adminApi.get(`/admins/${id}`);
        return response.data;
    },

    async createAdmin(data: CreateAdminRequest): Promise<ApiResponse<Admin>> {
        const response = await adminApi.post('/admins', data);
        return response.data;
    },

    async updateAdmin(id: string, data: Partial<CreateAdminRequest>): Promise<ApiResponse<Admin>> {
        const response = await adminApi.put(`/admins/${id}`, data);
        return response.data;
    },

    async deleteAdmin(id: string): Promise<ApiResponse<void>> {
        const response = await adminApi.delete(`/admins/${id}`);
        return response.data;
    },

    async getAvailablePermissions(): Promise<ApiResponse<PermissionOption[]>> {
        const response = await adminApi.get('/admins/permissions');
        return response.data;
    }
};
