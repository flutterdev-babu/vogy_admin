import { adminApi as api } from '@/lib/api';
import { ApiResponse, Ride, RideFilters, RideStatus } from '@/types';

export const adminRideService = {
  async getAllRides(filters?: RideFilters): Promise<ApiResponse<Ride[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const response = await api.get(`/rides${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  async getRideById(id: string): Promise<ApiResponse<Ride>> {
    const response = await api.get(`/rides/${id}`);
    return response.data;
  },

  async manualAssignPartner(rideId: string, partnerId: string, partnerCustomId?: string): Promise<ApiResponse<Ride>> {
    const response = await api.post(`/rides/${rideId}/assign-rider`, { partnerId, partnerCustomId });
    return response.data;
  },

  async updateStatus(id: string, status: string, options?: { userOtp?: string; startingKm?: number; endingKm?: number }): Promise<ApiResponse<any>> {
    const response = await api.patch(`/rides/${id}/status`, { status, ...options });
    return response.data;
  },

  async getRideOtp(id: string): Promise<ApiResponse<{ otp: string }>> {
    const response = await api.get(`/rides/${id}/otp`);
    return response.data;
  },

  async createManualRide(data: any): Promise<ApiResponse<Ride>> {
    const { rideApi } = await import('@/lib/api');
    const response = await rideApi.post('/create-manual', data);
    console.log("Manual Ride API Response:", response);
    return response.data;
  },

  async validateCoupon(data: any): Promise<ApiResponse<any>> {
    const response = await api.post('/rides/validate-coupon', data);
    return response.data;
  }
};
