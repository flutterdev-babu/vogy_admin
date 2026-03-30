import { userApi, userRidesApi, publicApi } from '@/lib/api';

export interface RideData {
    id: string;
    customId?: string;
    status: string;
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    dropAddress: string;
    dropLat: number;
    dropLng: number;
    distanceKm: number;
    totalFare?: number;
    baseFare?: number;
    perKmPrice?: number;
    paymentMode: string;
    paymentStatus: string;
    rideType: string;
    vehicleType?: { id: string; name: string; displayName: string; category: string };
    partner?: { id: string; name: string; phone: string };
    createdAt: string;
    updatedAt: string;
    scheduledDateTime?: string;
    startTime?: string;
    endTime?: string;
    advanceAmount?: number;
    transactionId?: string;
}

export interface CreateRidePayload {
    vehicleTypeId: string;
    pickupLat: number;
    pickupLng: number;
    pickupAddress: string;
    dropLat: number;
    dropLng: number;
    dropAddress: string;
    distanceKm: number;
    rideType?: string;
    altMobile?: string;
    paymentMode?: string;
    couponCode?: string;
    expectedFare?: number;
    cityCodeId?: string;
    advanceAmount?: number;
    transactionId?: string;
}

export interface FareEstimatePayload {
    distanceKm: number;
    cityCodeId: string;
    couponCode?: string;
    rideType?: string;
    pickupLat?: number;
    pickupLng?: number;
}

export const userRideService = {
    async createRide(data: CreateRidePayload) {
        const response = await userRidesApi.post('/new-ride', data);
        return response.data;
    },

    async initiatePayment(data: { amount: number; idempotencyKey: string; rideDetails?: any }) {
        const response = await userRidesApi.post('/initiate-payment', data);
        return response.data;
    },

    async verifyPayment(data: { verificationId: string; transactionId: string }) {
        const response = await userRidesApi.post('/verify-payment', data);
        return response.data;
    },

    async getActiveIntent() {
        const response = await userRidesApi.get('/active-intent');
        return response.data;
    },

    async getRides(status?: string) {
        const params = status ? { status } : {};
        const response = await userRidesApi.get('/all-rides', { params });
        return response.data;
    },

    async getRideById(id: string) {
        const response = await userRidesApi.get(`/rideby/${id}`);
        return response.data;
    },

    async cancelRide(id: string) {
        const response = await userRidesApi.post(`/${id}/cancel`);
        return response.data;
    },

    async estimateFare(data: FareEstimatePayload) {
        const response = await userRidesApi.post('/estimate-fare', data);
        return response.data;
    },

    async getRideSummary() {
        const response = await userApi.get('/rides/summary');
        return response.data;
    },

    async getActiveRide() {
        const response = await userApi.get('/rides/active');
        return response.data;
    },

    async getVehicleTypes() {
        const response = await publicApi.get('/vehicle-types');
        return response.data;
    },

    async getCityCodes() {
        const response = await publicApi.get('/city-codes');
        return response.data;
    },
};
