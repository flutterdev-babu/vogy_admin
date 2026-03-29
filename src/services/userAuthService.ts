import { authApi } from '@/lib/api';

export interface UserData {
    id: string;
    name: string;
    phone: string;
    email?: string;
    profileImage?: string;
    uniqueOtp: string;
    createdAt: string;
    updatedAt: string;
}

export const userAuthService = {
    async register(data: { name: string; phone: string; email?: string; password?: string }) {
        const response = await authApi.post('/register-user', data);
        return response.data;
    },

    async loginWithEmail(email: string, password: string) {
        const response = await authApi.post('/login-user', { email, password });
        return response.data;
    },

    async sendOtp(phone: string) {
        const response = await authApi.post('/send-otp', { phone, role: 'USER' });
        return response.data;
    },

    async verifyOtp(phone: string, code: string) {
        const response = await authApi.post('/verify-otp', { phone, role: 'USER', code });
        return response.data;
    },
};
