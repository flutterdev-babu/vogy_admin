import { adminApi } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface Permission {
    id: string;
    code: string;
    description: string;
    group: string;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: string[]; // List of permission codes
    isSystem?: boolean; // System roles cannot be deleted
    userCount?: number;
}

export interface CreateRoleRequest {
    name: string;
    description?: string;
    permissions: string[];
}

export const permissionService = {
    async getAllRoles(): Promise<ApiResponse<Role[]>> {
        const response = await adminApi.get('/roles');
        return response.data;
    },

    async getRoleById(id: string): Promise<ApiResponse<Role>> {
        const response = await adminApi.get(`/roles/${id}`);
        return response.data;
    },

    async createRole(data: CreateRoleRequest): Promise<ApiResponse<Role>> {
        const response = await adminApi.post('/roles', data);
        return response.data;
    },

    async updateRole(id: string, data: Partial<CreateRoleRequest>): Promise<ApiResponse<Role>> {
        const response = await adminApi.put(`/roles/${id}`, data);
        return response.data;
    },

    async deleteRole(id: string): Promise<ApiResponse<void>> {
        const response = await adminApi.delete(`/roles/${id}`);
        return response.data;
    },

    async getAllPermissions(): Promise<ApiResponse<Permission[]>> {
        const response = await adminApi.get('/permissions');
        return response.data;
    }
};
