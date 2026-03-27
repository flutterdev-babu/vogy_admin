import { adminApi } from '@/lib/api';
import { ApiResponse, PeakHourCharge, CreatePeakHourChargeRequest, UpdatePeakHourChargeRequest } from '@/types';

export const peakHourChargeService = {
  async getAll(vehicleTypeId?: string): Promise<ApiResponse<PeakHourCharge[]>> {
    const response = await adminApi.get('/peak-hour-charges', {
      params: { vehicleTypeId },
    });
    return response.data;
  },

  async create(data: CreatePeakHourChargeRequest): Promise<ApiResponse<PeakHourCharge>> {
    const response = await adminApi.post('/peak-hour-charges', data);
    return response.data;
  },

  async update(id: string, data: UpdatePeakHourChargeRequest): Promise<ApiResponse<PeakHourCharge>> {
    const response = await adminApi.put(`/peak-hour-charges/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await adminApi.delete(`/peak-hour-charges/${id}`);
    return response.data;
  },
};
