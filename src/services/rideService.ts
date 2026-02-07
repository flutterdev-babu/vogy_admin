import { rideApi as api } from '@/lib/api';
import { ApiResponse, Ride, RideFilters } from '@/types';

export const rideService = {
  async getAll(filters?: RideFilters): Promise<ApiResponse<Ride[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.vehicleType) params.append('vehicleType', filters.vehicleType);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.partnerId) params.append('partnerId', filters.partnerId);
    
    // Support for status=FUTURE as per guide
    const queryString = params.toString();
    const response = await api.get(`/all-rides${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<Ride>> {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  async getScheduled(): Promise<ApiResponse<Ride[]>> {
    const response = await api.get('/scheduled');
    return response.data;
  },

  async assignPartner(rideId: string, partnerId: string): Promise<ApiResponse<Ride>> {
    const response = await api.post(`/${rideId}/assign`, { partnerId });
    return response.data;
  },
};
