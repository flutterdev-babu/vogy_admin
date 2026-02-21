import { adminApi } from '@/lib/api';
import { 
  ApiResponse, 
  Vehicle, 
  CreateVehicleRequest,
  VehicleFilters,
  EntityVerificationStatus,
  EntityActiveStatus
} from '@/types';

export const vehicleService = {
  async create(data: CreateVehicleRequest): Promise<ApiResponse<Vehicle>> {
    const response = await adminApi.post('/vehicles', data);
    return response.data;
  },
  async getAll(filters?: VehicleFilters): Promise<ApiResponse<Vehicle[]>> {
    const response = await adminApi.get('/vehicles', { params: filters });
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Vehicle>> {
    const response = await adminApi.get(`/vehicles/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateVehicleRequest>): Promise<ApiResponse<Vehicle>> {
    const response = await adminApi.put(`/vehicles/${id}`, data);
    return response.data;
  },

  async verify(id: string, status: EntityVerificationStatus): Promise<ApiResponse<Vehicle>> {
    const response = await adminApi.patch(`/vehicles/${id}/verify`, { status });
    return response.data;
  },

  async updateStatus(id: string, status: EntityActiveStatus): Promise<ApiResponse<Vehicle>> {
    const response = await adminApi.patch(`/vehicles/${id}/status`, { status });
    return response.data;
  },

  async deleteVehicle(id: string): Promise<ApiResponse<void>> {
    const response = await adminApi.delete(`/vehicles/${id}`);
    return response.data;
  },
};
