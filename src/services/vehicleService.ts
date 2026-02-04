import { adminApi } from '@/lib/api';
import { 
  ApiResponse, 
  Vehicle, 
  CreateVehicleRequest,
  VehicleFilters
} from '@/types';

export const vehicleService = {
  async create(data: CreateVehicleRequest): Promise<ApiResponse<Vehicle>> {
    const response = await adminApi.post('/vehicles', data);
    return response.data;
  },

  async getAll(filters?: VehicleFilters): Promise<ApiResponse<Vehicle[]>> {
    const params = new URLSearchParams();
    if (filters?.vendorId) params.append('vendorId', filters.vendorId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.search) params.append('search', filters.search);
    
    const response = await adminApi.get(`/vehicles?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Vehicle>> {
    const response = await adminApi.get(`/vehicles/${id}`);
    return response.data;
  },
};
