import { adminApi } from '@/lib/api';
import { ApiResponse, VehiclePricingGroup, CreateVehiclePricingGroupRequest, UpdateVehiclePricingGroupRequest } from '@/types';

export const vehiclePricingGroupService = {
  async getAll(vehicleTypeId?: string): Promise<ApiResponse<VehiclePricingGroup[]>> {
    const response = await adminApi.get('/admin/vehicle-pricing-groups', {
      params: { vehicleTypeId },
    });
    return response.data;
  },

  async create(data: CreateVehiclePricingGroupRequest): Promise<ApiResponse<VehiclePricingGroup>> {
    const response = await adminApi.post('/admin/vehicle-pricing-groups', data);
    return response.data;
  },

  async update(id: string, data: UpdateVehiclePricingGroupRequest): Promise<ApiResponse<VehiclePricingGroup>> {
    const response = await adminApi.put(`/admin/vehicle-pricing-groups/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await adminApi.delete(`/admin/vehicle-pricing-groups/${id}`);
    return response.data;
  },
};
