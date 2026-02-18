import { adminApi } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'ALERT' | 'PROMO';
    targetAudience: 'ALL' | 'VENDORS' | 'PARTNERS' | 'USERS' | 'AGENTS';
    sentAt: string;
    sentBy: string;
    status: 'SENT' | 'SCHEDULED' | 'DRAFT';
}

export interface SendNotificationRequest {
    title: string;
    message: string;
    type: Notification['type'];
    targetAudience: Notification['targetAudience'];
    scheduledFor?: string;
}

export const notificationService = {
    async getAll(): Promise<ApiResponse<Notification[]>> {
        const response = await adminApi.get('/notifications');
        return response.data;
    },

    async send(data: SendNotificationRequest): Promise<ApiResponse<Notification>> {
        const response = await adminApi.post('/notifications/send', data);
        return response.data;
    },

    async delete(id: string): Promise<ApiResponse<void>> {
        const response = await adminApi.delete(`/notifications/${id}`);
        return response.data;
    }
};
