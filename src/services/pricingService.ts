import api from '@/lib/api';
import { ApiResponse, PricingConfig, UpdatePricingConfigRequest } from '@/types';

export const pricingService = {
  async get(): Promise<ApiResponse<PricingConfig>> {
    const response = await api.get('/pricing-config');
    return response.data;
  },

  async update(data: UpdatePricingConfigRequest): Promise<ApiResponse<PricingConfig>> {
    const response = await api.put('/pricing-config', data);
    return response.data;
  },
};
