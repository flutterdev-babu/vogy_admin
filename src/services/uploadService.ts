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
    // Step 1: Get presigned URL from backend
    const presignedRes = await publicApi.post('/upload/presigned-url', {
      fileName: file.name,
      fileType: file.type,
      folder,
      fileSize: file.size,
    });

    if (!presignedRes.data?.success || !presignedRes.data?.data) {
      throw new Error(presignedRes.data?.error || 'Failed to get upload URL');
    }

    const { presignedUrl, finalUrl } = presignedRes.data.data;

    // Step 2: Upload file directly to R2 using the presigned URL
    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed with status ${uploadRes.status}`);
    }

    // Step 3: Return the final public URL
    return finalUrl;
  },
};
