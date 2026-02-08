import { adminApi } from '@/lib/api';
import { ApiResponse, VehicleType, CreateVehicleTypeRequest, UpdateVehicleTypeRequest } from '@/types';

export const vehicleTypeService = {
  async getAll(): Promise<ApiResponse<VehicleType[]>> {
    const response = await adminApi.get('/vehicle-types');
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<VehicleType>> {
    const response = await adminApi.get(`/vehicle-types/${id}`);
    return response.data;
  },

  async create(data: CreateVehicleTypeRequest): Promise<ApiResponse<VehicleType>> {
    const response = await adminApi.post('/vehicle-types', data);
    return response.data;
  },

  async update(id: string, data: UpdateVehicleTypeRequest): Promise<ApiResponse<VehicleType>> {
    const response = await adminApi.put(`/vehicle-types/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await adminApi.delete(`/vehicle-types/${id}`);
    return response.data;
  },
};
