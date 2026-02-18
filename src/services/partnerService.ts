import { partnerApi, adminApi } from '@/lib/api';
import {
  ApiResponse,
  Partner,
  PartnerRegisterRequest,
  PartnerLoginRequest,
  PartnerLoginResponse,
  Ride,
  PartnerFilters,
  EntityStatus,
  PartnerDashboardData,
  PartnerVehicleData,
  PartnerEarningsData
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
  // Partner Dashboard & Analytics APIs
  // =====================
  
  async getDashboard(): Promise<ApiResponse<PartnerDashboardData>> {
    const response = await partnerApi.get('/dashboard');
    return response.data;
  },

  async getVehicle(): Promise<ApiResponse<PartnerVehicleData>> {
    const response = await partnerApi.get('/vehicle');
    return response.data;
  },

  async getRideById(id: string): Promise<ApiResponse<Ride>> {
    const response = await partnerApi.get(`/rides/${id}`);
    return response.data;
  },

  async getEarnings(): Promise<ApiResponse<PartnerEarningsData>> {
    const response = await partnerApi.get('/earnings');
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

  async createPartner(data: PartnerRegisterRequest): Promise<ApiResponse<Partner>> {
    const response = await adminApi.post('/partners', data);
    return response.data;
  },

  // =====================
  // Feedback & Inbox (Partner)
  // =====================

  async getFeedback(): Promise<ApiResponse<any[]>> {
    const response = await partnerApi.get('/feedback');
    return response.data;
  },

  async getNotifications(): Promise<ApiResponse<any[]>> {
    const response = await partnerApi.get('/notifications');
    return response.data;
  },

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    const response = await partnerApi.put(`/notifications/${id}/read`);
    return response.data;
  },

  // =====================
  // Documents & Settings
  // =====================

  async getDocuments(): Promise<ApiResponse<any[]>> {
    const response = await partnerApi.get('/documents');
    return response.data;
  },

  async uploadDocument(formData: FormData): Promise<ApiResponse<any>> {
    const response = await partnerApi.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateProfile(data: Partial<Partner>): Promise<ApiResponse<Partner>> {
    const response = await partnerApi.put('/profile', data);
    return response.data;
  },
};
