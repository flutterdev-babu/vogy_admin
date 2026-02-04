import { adminApi } from '@/lib/api';
import { 
  ApiResponse, 
  Billing,
  GenerateBillingRequest,
  Payment,
  RecordPaymentRequest
} from '@/types';

export const billingService = {
  async generateBilling(data: GenerateBillingRequest): Promise<ApiResponse<Billing>> {
    const response = await adminApi.post('/billing', data);
    return response.data;
  },

  async recordPayment(data: RecordPaymentRequest): Promise<ApiResponse<Payment>> {
    const response = await adminApi.post('/payments', data);
    return response.data;
  },

  async getOutstanding(corporateId?: string): Promise<ApiResponse<Billing[]>> {
    const params = new URLSearchParams();
    if (corporateId) params.append('corporateId', corporateId);
    
    const response = await adminApi.get(`/billing/outstanding?${params.toString()}`);
    return response.data;
  },

  async getAllBillings(): Promise<ApiResponse<Billing[]>> {
    const response = await adminApi.get('/billing');
    return response.data;
  },

  async getAllPayments(): Promise<ApiResponse<Payment[]>> {
    const response = await adminApi.get('/payments');
    return response.data;
  },
};
