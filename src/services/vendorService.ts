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
  EntityStatus,
  EntityVerificationStatus,
  EntityActiveStatus,
  VendorDashboardData,
  VendorAttachment,
  VendorEarningsData,
  VerifyAttachmentRequest, // Repurposing or using for consistency
  UpdateStatusRequest
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
  // Vendor Dashboard & Analytics APIs
  // =====================
  
  async getDashboard(): Promise<ApiResponse<VendorDashboardData>> {
    const response = await vendorApi.get('/dashboard');
    return response.data;
  },

  async getAttachments(): Promise<ApiResponse<VendorAttachment[]>> {
    const response = await vendorApi.get('/attachments');
    return response.data;
  },

  async getRideById(id: string): Promise<ApiResponse<Ride>> {
    const response = await vendorApi.get(`/rides/${id}`);
    return response.data;
  },

  async getEarnings(): Promise<ApiResponse<VendorEarningsData>> {
    const response = await vendorApi.get('/earnings');
    return response.data;
  },

  async getAnalytics(): Promise<ApiResponse<VendorAnalytics>> {
    const response = await vendorApi.get('/analytics');
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


  // =====================
  // Admin Vendor APIs
  // =====================

  async getAll(filters?: VendorFilters): Promise<ApiResponse<Vendor[]>> {
    const response = await adminApi.get('/vendors', { params: filters });
    console.log("Vendor API Response:", response);
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Vendor>> {
    const response = await adminApi.get(`/vendors/${id}`);
    return response.data;
  },

  async updateVendor(id: string, data: Partial<VendorRegisterRequest>): Promise<ApiResponse<Vendor>> {
    const response = await adminApi.put(`/vendors/${id}`, data);
    return response.data;
  },

  async verify(id: string, status: EntityVerificationStatus): Promise<ApiResponse<Vendor>> {
    const response = await adminApi.patch(`/vendors/${id}/verify`, { status });
    return response.data;
  },

  async updateStatus(id: string, status: EntityActiveStatus): Promise<ApiResponse<Vendor>> {
    const response = await adminApi.patch(`/vendors/${id}/status`, { status });
    return response.data;
  },

  async createVendor(data: VendorRegisterRequest): Promise<ApiResponse<Vendor>> {
    const response = await adminApi.post('/vendors', data);
    return response.data;
  },

  async deleteVendor(id: string): Promise<ApiResponse<void>> {
    const response = await adminApi.delete(`/vendors/${id}`);
    return response.data;
  },

  // =====================
  // Fleet Management (Vendor)
  // =====================

  async addVehicle(data: any): Promise<ApiResponse<Vehicle>> {
    const response = await vendorApi.post('/vehicles', data);
    return response.data;
  },

  async updateVehicle(id: string, data: any): Promise<ApiResponse<Vehicle>> {
    const response = await vendorApi.put(`/vehicles/${id}`, data);
    return response.data;
  },

  async deleteVehicle(id: string): Promise<ApiResponse<void>> {
    const response = await vendorApi.delete(`/vehicles/${id}`);
    return response.data;
  },

  // =====================
  // Driver Management (Vendor)
  // =====================

  async getDrivers(): Promise<ApiResponse<any[]>> {
    const response = await vendorApi.get('/drivers');
    return response.data;
  },

  async addDriver(data: any): Promise<ApiResponse<any>> {
    const response = await vendorApi.post('/drivers', data);
    return response.data;
  },

  async updateDriver(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await vendorApi.put(`/drivers/${id}`, data);
    return response.data;
  },

  async deleteDriver(id: string): Promise<ApiResponse<void>> {
    const response = await vendorApi.delete(`/drivers/${id}`);
    return response.data;
  },

  // =====================
  // Support System (Vendor)
  // =====================

  async getSupportTickets(): Promise<ApiResponse<any[]>> {
    const response = await vendorApi.get('/support/tickets');
    return response.data;
  },

  async createSupportTicket(data: { subject: string; message: string; priority: string }): Promise<ApiResponse<any>> {
    const response = await vendorApi.post('/support/tickets', data);
    return response.data;
  },

  async sendSupportMessage(ticketId: string, message: string): Promise<ApiResponse<any>> {
    const response = await vendorApi.post(`/support/tickets/${ticketId}/messages`, { message });
    return response.data;
  },
};
