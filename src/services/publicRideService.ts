import { publicApi } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface PublicBookingData {
  userName: string;
  userPhone: string;
  pickupAddress: string;
  dropAddress?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropLat?: number;
  dropLng?: number;
  distanceKm: number;
  scheduledDateTime: string;
  rideType: string;
  vehicleTypeId: string;
  cityCodeId: string;
  passengers?: string;
}

export const publicRideService = {
  async getVehicleTypes(): Promise<ApiResponse<any[]>> {
    const response = await publicApi.get('/rides/vehicle-types');
    return response.data;
  },

  async estimateFare(params: {
    distanceKm: number;
    cityCodeId: string;
    pickupLat?: number;
    pickupLng?: number;
  }): Promise<ApiResponse<any>> {
    const response = await publicApi.get('/rides/fare-estimate', { params });
    return response.data;
  },

  async bookRide(data: PublicBookingData): Promise<ApiResponse<any>> {
    const response = await publicApi.post('/rides/book', data);
    return response.data;
  },

  async getCityCodes(): Promise<ApiResponse<any[]>> {
    const response = await publicApi.get('/city-codes');
    return response.data;
  }
};
