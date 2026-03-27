import { adminApi } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface AuditLog {
    id: string;
    userId: string | null;
    userName: string | null;
    userRole: string | null;
    action: string;
    module: string;
    entityId: string | null;
    description: string;
    oldData: any;
    newData: any;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

export interface AuditLogFilters {
    startDate?: string;
    endDate?: string;
    action?: string;
    module?: string;
    search?: string;
    userId?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const auditLogService = {
    async getAll(filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.action) params.append('action', filters.action);
        if (filters?.module) params.append('module', filters.module);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.userId) params.append('userId', filters.userId);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await adminApi.get(`/audit-logs?${params.toString()}`);
        return response.data;
    },

    async getById(id: string): Promise<ApiResponse<AuditLog>> {
        const response = await adminApi.get(`/audit-logs/${id}`);
        return response.data;
    }
};
