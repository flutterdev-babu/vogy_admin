import api from '@/lib/api';
import { ApiResponse, VehicleType, CreateVehicleTypeRequest, UpdateVehicleTypeRequest } from '@/types';

export const vehicleTypeService = {
  async getAll(): Promise<ApiResponse<VehicleType[]>> {
    const response = await api.get('/vehicle-types');
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<VehicleType>> {
    const response = await api.get(`/vehicle-types/${id}`);
    return response.data;
  },

  async create(data: CreateVehicleTypeRequest): Promise<ApiResponse<VehicleType>> {
    const response = await api.post('/vehicle-types', data);
    return response.data;
  },

  async update(id: string, data: UpdateVehicleTypeRequest): Promise<ApiResponse<VehicleType>> {
    const response = await api.put(`/vehicle-types/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/vehicle-types/${id}`);
    return response.data;
  },
};
