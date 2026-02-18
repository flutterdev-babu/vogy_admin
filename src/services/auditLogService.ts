import { adminApi } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    performedBy: string; // User ID or Name
    performedAt: string;
    details: string;
    ipAddress: string;
}

export interface AuditLogFilters {
    startDate?: string;
    endDate?: string;
    action?: string;
    performedBy?: string;
}

export const auditLogService = {
    async getAll(filters?: AuditLogFilters): Promise<ApiResponse<AuditLog[]>> {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.action) params.append('action', filters.action);
        if (filters?.performedBy) params.append('performedBy', filters.performedBy);

        const response = await adminApi.get(`/audit-logs?${params.toString()}`);
        return response.data;
    },

    async getById(id: string): Promise<ApiResponse<AuditLog>> {
        const response = await adminApi.get(`/audit-logs/${id}`);
        return response.data;
    }
};
