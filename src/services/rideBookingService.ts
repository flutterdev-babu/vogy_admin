import { rideApi } from '@/lib/api';
import { ApiResponse } from '@/types';

// ---------- Types ----------

export interface VehicleOption {
  vehicleTypeId: string;
  category: string;
  name: string;
  displayName: string;
  baseFare: number;
  pricePerKm: number;
  estimatedFare: number;
  discountAmount?: number;
  finalFare?: number;
}

export interface FareEstimateResponse {
  distanceKm: number;
  vehicleOptions: VehicleOption[];
  couponApplied?: {
    couponCode: string;
    discountPercentage: number;
    maxDiscountAmount: number;
  };
}

export interface ValidateCouponResponse {
  couponId: string;
  discountAmount: number;
  couponCode: string;
}

export interface NewRideRequest {
  vehicleTypeId: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropLat: number;
  dropLng: number;
  dropAddress: string;
  distanceKm: number;
  cityCodeId: string;
  couponCode?: string;
  expectedFare: number;
  paymentMode: string;
  scheduledDateTime?: string;
  userName?: string;
  userPhone?: string;
  bookingNotes?: string;
}

// ---------- Service ----------

export const rideBookingService = {
  // Step 1: Get fare estimates for all vehicle types
  async estimateFare(data: {
    distanceKm: number;
    cityCodeId: string;
    couponCode?: string;
  }): Promise<ApiResponse<FareEstimateResponse>> {
    const response = await rideApi.get('/fare-estimate', { params: data });
    return response.data;
  },

  // Step 2: Validate coupon for a specific fare
  async validateCoupon(data: {
    couponCode: string;
    cityCodeId: string;
    totalFare: number;
  }): Promise<ApiResponse<ValidateCouponResponse>> {
    const response = await rideApi.post('/validate-coupon', data);
    return response.data;
  },

  // Step 3: Confirm booking with price lock
  async newRide(data: NewRideRequest): Promise<ApiResponse<any>> {
    const response = await rideApi.post('/create-manual', data);
    return response.data;
  },
};
