import api from '@/lib/api';
import { ApiResponse, Coupon } from '@/types';

export interface CreateCouponRequest {
  couponCode: string;
  description?: string;
  discountValue: number;
  minBookingAmount: number;
  maxDiscountAmount: number;
  validFrom: string;
  validTo: string;
}

export interface UpdateCouponRequest {
  discountValue?: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
}

export const couponService = {
  // Fetch all coupons (can optionally filter by agentId or isActive)
  async getAll(params?: { agentId?: string; isActive?: boolean }): Promise<ApiResponse<Coupon[]>> {
    const response = await api.get('/agent-coupons', { params });
    return response.data;
  },

  // Get a single coupon by ID
  async getById(id: string): Promise<ApiResponse<Coupon>> {
    const response = await api.get(`/agent-coupons/${id}`);
    return response.data;
  },

  // Create a new exclusive agent coupon
  async create(data: CreateCouponRequest): Promise<ApiResponse<Coupon>> {
    const response = await api.post('/agent-coupons', data);
    return response.data;
  },

  // Update existing coupon details
  async update(id: string, data: UpdateCouponRequest): Promise<ApiResponse<Coupon>> {
    const response = await api.put(`/agent-coupons/${id}`, data);
    return response.data;
  },

  // Toggle active/inactive status quickly mapped to PUT
  async toggleStatus(id: string, isActive: boolean): Promise<ApiResponse<Coupon>> {
    const response = await api.put(`/agent-coupons/${id}`, { isActive });
    return response.data;
  },

  // Delete Coupon
  async delete(id: string): Promise<ApiResponse<any>> {
    const response = await api.delete(`/agent-coupons/${id}`);
    return response.data;
  }
};
