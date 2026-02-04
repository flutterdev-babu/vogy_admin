import { vendorApi, adminApi } from '@/lib/api';
import { 
  ApiResponse, 
  Vendor, 
  VendorRegisterRequest, 
  VendorLoginRequest, 
  VendorLoginResponse,
  VendorAnalytics,
  Vehicle,
  Ride,
  VendorFilters,
  EntityStatus
} from '@/types';

export const vendorService = {
  // =====================
  // Vendor Auth APIs
  // =====================
  
  async register(data: VendorRegisterRequest): Promise<ApiResponse<Vendor>> {
    const response = await vendorApi.post('/auth/register', data);
    return response.data;
  },

  async login(data: VendorLoginRequest): Promise<ApiResponse<VendorLoginResponse>> {
    const response = await vendorApi.post('/auth/login', data);
    return response.data;
  },

  // =====================
  // Vendor Profile APIs
  // =====================
  
  async getProfile(): Promise<ApiResponse<Vendor>> {
    const response = await vendorApi.get('/profile');
    return response.data;
  },

  async updateProfile(data: Partial<Vendor>): Promise<ApiResponse<Vendor>> {
    const response = await vendorApi.put('/profile', data);
    return response.data;
  },

  // =====================
  // Vendor Data APIs
  // =====================
  
  async getVehicles(): Promise<ApiResponse<Vehicle[]>> {
    const response = await vendorApi.get('/vehicles');
    return response.data;
  },

  async getRides(filters?: { status?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<Ride[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await vendorApi.get(`/rides?${params.toString()}`);
    return response.data;
  },

  async getAnalytics(): Promise<ApiResponse<VendorAnalytics>> {
    const response = await vendorApi.get('/analytics');
    return response.data;
  },

  // =====================
  // Admin Vendor APIs
  // =====================
  
  async getAll(filters?: VendorFilters): Promise<ApiResponse<Vendor[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await adminApi.get(`/vendors?${params.toString()}`);
    return response.data;
  },

  async updateStatus(id: string, status: EntityStatus): Promise<ApiResponse<Vendor>> {
    const response = await adminApi.put(`/vendors/${id}/status`, { status });
    return response.data;
  },
};
