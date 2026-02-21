import { adminApi as api } from '@/lib/api';
import { ApiResponse, Attachment, AttachmentStatus, VerifyAttachmentRequest, CreateAttachmentRequest } from '@/types';

export const attachmentService = {
  async getAll(status?: AttachmentStatus): Promise<ApiResponse<Attachment[]>> {
    const response = await api.get(`/attachments${status ? `?status=${status}` : ''}`);
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Attachment>> {
    const response = await api.get(`/attachments/${id}`);
    return response.data;
  },

  async verify(id: string, data: VerifyAttachmentRequest): Promise<ApiResponse<any>> {
    const response = await api.patch(`/attachments/${id}/verify`, data); // Changed to PATCH as per lifecycle guide
    return response.data;
  },

  async update(id: string, data: Partial<CreateAttachmentRequest>): Promise<ApiResponse<Attachment>> {
    const response = await api.put(`/attachments/${id}`, data);
    return response.data;
  },

  async create(data: CreateAttachmentRequest): Promise<ApiResponse<Attachment>> {
    const response = await api.post('/attachments', data);
    return response.data;
  },

  async deleteAttachment(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/attachments/${id}`);
    return response.data;
  }
};
