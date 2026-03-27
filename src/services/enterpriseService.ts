import { adminApi } from '@/lib/api';

export const settlementService = {
  async getStats() {
    const response = await adminApi.get('/settlements/stats');
    return response.data;
  },

  async getPartnerSettlements() {
    const response = await adminApi.get('/settlements/partners');
    return response.data;
  },

  async getVendorSettlements() {
    const response = await adminApi.get('/settlements/vendors');
    return response.data;
  },
};

export const fraudService = {
  async getFraudAlerts() {
    const response = await adminApi.get('/fraud-alerts');
    return response.data;
  },
};

export const broadcastService = {
  async sendBroadcast(data: { title: string; body: string; imageUrl?: string; targetAudience: string }) {
    const response = await adminApi.post('/broadcast/send', data);
    return response.data;
  },

  async getHistory() {
    const response = await adminApi.get('/broadcast/history');
    return response.data;
  },
};
