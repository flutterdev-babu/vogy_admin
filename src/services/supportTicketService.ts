import { adminApi } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface TicketMessage {
    id: string;
    ticketId: string;
    senderType: 'ADMIN' | 'USER' | 'PARTNER' | 'SYSTEM';
    senderId?: string;
    senderName: string;
    message: string;
    isInternal: boolean;
    createdAt: string;
}

export interface SupportTicket {
    id: string;
    ticketNumber: string;
    category: string;
    priority: string;
    status: string;
    subject: string;
    description: string;
    customerType: 'USER' | 'PARTNER';
    customerId: string;
    customerName: string;
    customerPhone?: string;
    rideId?: string;
    assignedToId?: string;
    resolvedAt?: string;
    resolution?: string;
    createdAt: string;
    updatedAt: string;
    messages?: TicketMessage[];
}

export interface TicketStats {
    total: number;
    open: number;
    inProgress: number;
    resolvedToday: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
}

export const supportTicketService = {
    async getAllTickets(params?: any): Promise<ApiResponse<SupportTicket[]>> {
        const response = await adminApi.get('/support-tickets', { params });
        return response.data;
    },

    async getTicketStats(): Promise<ApiResponse<TicketStats>> {
        const response = await adminApi.get('/support-tickets/stats');
        return response.data;
    },

    async getTicketById(id: string): Promise<ApiResponse<SupportTicket>> {
        const response = await adminApi.get(`/support-tickets/${id}`);
        return response.data;
    },

    async createTicket(data: any): Promise<ApiResponse<SupportTicket>> {
        const response = await adminApi.post('/support-tickets', data);
        return response.data;
    },

    async updateTicket(id: string, data: any): Promise<ApiResponse<SupportTicket>> {
        const response = await adminApi.put(`/support-tickets/${id}`, data);
        return response.data;
    },

    async assignTicket(id: string, adminId: string): Promise<ApiResponse<SupportTicket>> {
        const response = await adminApi.post(`/support-tickets/${id}/assign`, { adminId });
        return response.data;
    },

    async addMessage(id: string, data: { message: string, isInternal?: boolean }): Promise<ApiResponse<TicketMessage>> {
        const response = await adminApi.post(`/support-tickets/${id}/messages`, data);
        return response.data;
    },

    async resolveTicket(id: string, resolution: string): Promise<ApiResponse<SupportTicket>> {
        const response = await adminApi.post(`/support-tickets/${id}/resolve`, { resolution });
        return response.data;
    },

    async getTicketByRideId(rideId: string): Promise<ApiResponse<SupportTicket>> {
        const response = await adminApi.get('/support-tickets', { params: { rideId } });
        if (response.data.success && response.data.data) {
            const tickets = (response.data.data as any).tickets || response.data.data;
            const rideTicket = Array.isArray(tickets) && tickets.length > 0 ? tickets[0] : null;
            return { ...response.data, data: rideTicket };
        }
        return response.data;
    }
};
