import { paymentApi } from '@/lib/api';
import { ApiResponse } from '@/types';

export const paymentService = {
  /**
   * Create a Razorpay order for a ride
   */
  async createOrder(rideId: string): Promise<ApiResponse<any>> {
    const response = await paymentApi.post('/create-order', { rideId });
    return response.data;
  },

  /**
   * Verify Razorpay payment signature
   */
  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<ApiResponse<any>> {
    const response = await paymentApi.post('/verify-payment', data);
    return response.data;
  }
};
