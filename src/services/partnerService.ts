import { partnerApi, adminApi } from '@/lib/api';
import { 
  ApiResponse, 
  Partner, 
  PartnerRegisterRequest, 
  PartnerLoginRequest, 
  PartnerLoginResponse,
  Ride,
  PartnerFilters,
  EntityStatus
} from '@/types';

export const partnerService = {
  // =====================
  // Partner Auth APIs
  // =====================
  
  async register(data: PartnerRegisterRequest): Promise<ApiResponse<Partner>> {
    const response = await partnerApi.post('/auth/register', data);
    return response.data;
  },

  async login(data: PartnerLoginRequest): Promise<ApiResponse<PartnerLoginResponse>> {
    const response = await partnerApi.post('/auth/login', data);
    return response.data;
  },

  // =====================
  // Partner Profile APIs
  // =====================
  
  async getProfile(): Promise<ApiResponse<Partner>> {
    const response = await partnerApi.get('/profile');
    return response.data;
  },

  async updateLocation(lat: number, lng: number): Promise<ApiResponse<Partner>> {
    const response = await partnerApi.put('/location', { lat, lng });
    return response.data;
  },

  async toggleOnlineStatus(isOnline: boolean): Promise<ApiResponse<Partner>> {
    const response = await partnerApi.put('/online-status', { isOnline });
    return response.data;
  },

  // =====================
  // Partner Data APIs
  // =====================
  
  async getRides(): Promise<ApiResponse<Ride[]>> {
    const response = await partnerApi.get('/rides');
    return response.data;
  },

  // =====================
  // Admin Partner APIs
  // =====================
  
  async getAll(filters?: PartnerFilters): Promise<ApiResponse<Partner[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.isOnline !== undefined) params.append('isOnline', String(filters.isOnline));
    if (filters?.search) params.append('search', filters.search);
    
    const response = await adminApi.get(`/partners?${params.toString()}`);
    return response.data;
  },

  async updateStatus(id: string, status: EntityStatus): Promise<ApiResponse<Partner>> {
    const response = await adminApi.put(`/partners/${id}/status`, { status });
    return response.data;
  },

  async assignVehicle(partnerId: string, vehicleId: string): Promise<ApiResponse<Partner>> {
    const response = await adminApi.post(`/partners/${partnerId}/assign-vehicle`, { vehicleId });
    return response.data;
  },
};
