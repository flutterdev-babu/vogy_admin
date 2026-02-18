import { adminApi as api } from '@/lib/api';
import { ApiResponse, Attachment, AttachmentStatus, VerifyAttachmentRequest } from '@/types';

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
    const response = await api.post(`/attachments/${id}/verify`, data);
    return response.data;
  }
};
