import { corporateApi, adminApi } from '@/lib/api';
import { 
  ApiResponse, 
  Corporate, 
  CorporateRegisterRequest, 
  CorporateLoginRequest, 
  CorporateLoginResponse,
  Ride,
  Billing,
  BillingSummary,
  Payment,
  EntityStatus
} from '@/types';

export const corporateService = {
  // =====================
  // Corporate Auth APIs
  // =====================
  
  async register(data: CorporateRegisterRequest): Promise<ApiResponse<Corporate>> {
    const response = await corporateApi.post('/auth/register', data);
    return response.data;
  },

  async login(data: CorporateLoginRequest): Promise<ApiResponse<CorporateLoginResponse>> {
    const response = await corporateApi.post('/auth/login', data);
    return response.data;
  },

  // =====================
  // Corporate Profile APIs
  // =====================
  
  async getProfile(): Promise<ApiResponse<Corporate>> {
    const response = await corporateApi.get('/profile');
    return response.data;
  },

  // =====================
  // Corporate Data APIs
  // =====================
  
  async getRides(): Promise<ApiResponse<Ride[]>> {
    const response = await corporateApi.get('/rides');
    return response.data;
  },

  async getBilling(): Promise<ApiResponse<Billing[]>> {
    const response = await corporateApi.get('/billing');
    return response.data;
  },

  async getBillingSummary(): Promise<ApiResponse<BillingSummary>> {
    const response = await corporateApi.get('/billing/summary');
    return response.data;
  },

  async getPayments(): Promise<ApiResponse<Payment[]>> {
    const response = await corporateApi.get('/payments');
    return response.data;
  },

  // =====================
  // Admin Corporate APIs
  // =====================
  
  async getAll(): Promise<ApiResponse<Corporate[]>> {
    const response = await adminApi.get('/corporates');
    return response.data;
  },

  async updateStatus(id: string, status: EntityStatus): Promise<ApiResponse<Corporate>> {
    const response = await adminApi.put(`/corporates/${id}/status`, { status });
    return response.data;
  },

  async updateCreditLimit(id: string, creditLimit: number): Promise<ApiResponse<Corporate>> {
    const response = await adminApi.put(`/corporates/${id}/credit-limit`, { creditLimit });
    return response.data;
  },
};
