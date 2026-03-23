import { publicApi } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface EnquiryData {
    phone: string;
    pickup: string;
    drop?: string;
    rideType?: string;
    message?: string;
}

export const enquiryService = {
    async submitEnquiry(data: EnquiryData): Promise<ApiResponse<void>> {
        const response = await publicApi.post('/enquiry', data);
        return response.data;
    }
};
