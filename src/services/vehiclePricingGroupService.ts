import { adminApi } from '@/lib/api';
import { ApiResponse, VehiclePricingGroup, CreateVehiclePricingGroupRequest, UpdateVehiclePricingGroupRequest } from '@/types';

export const vehiclePricingGroupService = {
  async getAll(vehicleTypeId?: string, serviceType?: string): Promise<ApiResponse<VehiclePricingGroup[]>> {
    const response = await adminApi.get('/vehicle-pricing-groups', {
      params: { vehicleTypeId, serviceType },
    });
    return response.data;
  },

  async create(data: CreateVehiclePricingGroupRequest): Promise<ApiResponse<VehiclePricingGroup>> {
    const response = await adminApi.post('/vehicle-pricing-groups', data);
    return response.data;
  },

  async update(id: string, data: UpdateVehiclePricingGroupRequest): Promise<ApiResponse<VehiclePricingGroup>> {
    const response = await adminApi.put(`/vehicle-pricing-groups/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await adminApi.delete(`/vehicle-pricing-groups/${id}`);
    return response.data;
  },
};
