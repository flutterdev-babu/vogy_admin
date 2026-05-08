import { publicApi } from '@/lib/api';

/**
 * Shared upload service for all registration forms.
 * Handles the presigned URL flow: get URL → upload to R2 → return public URL.
 */
export const uploadService = {
  /**
   * Upload a file to Cloudflare R2 via presigned URL.
   * @param file - The File object to upload
   * @param folder - The folder in R2 to store the file (e.g., 'partner_documents', 'pan_cards')
   * @returns The final public URL of the uploaded file
   */
  async uploadFile(file: File, folder: string = 'documents'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await publicApi.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data?.success || !response.data?.data?.url) {
      throw new Error(response.data?.message || 'Failed to upload file');
    }

    return response.data.data.url;
  },
};
