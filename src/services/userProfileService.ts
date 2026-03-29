import { userApi } from '@/lib/api';

export interface SavedPlace {
    id: string;
    label: 'Home' | 'Work' | 'Other';
    address: string;
    lat: number;
    lng: number;
}

export const userProfileService = {
    async getProfile() {
        const response = await userApi.get('/profile');
        return response.data;
    },

    async updateProfile(data: { name?: string; email?: string; profileImage?: string }) {
        const response = await userApi.put('/profile', data);
        return response.data;
    },

    async updatePassword(password: string) {
        const response = await userApi.put('/profile/password', { password });
        return response.data;
    },

    async getSavedPlaces() {
        const response = await userApi.get('/saved-places');
        return response.data;
    },

    async updateSavedPlaces(places: SavedPlace[]) {
        const response = await userApi.put('/saved-places', { places });
        return response.data;
    },
};
