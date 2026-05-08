import { publicApi } from '@/lib/api';

export interface UploadPresignedUrlResponse {
  success: boolean;
  data: {
    presignedUrl: string;
    finalUrl: string;
    objectKey: string;
  };
}

export interface DeleteFileResponse {
  success: boolean;
  message: string;
  deletedKey: string;
}

export const uploadService = {
  /**
   * Uploads a file using the robust FormData approach (Fixed CORS/Fetch issues).
   *
   * @param file The literal File object to upload
   * @param folder The folder path to store the file in (e.g. 'profile_pictures')
   * @param oldFileUrl Optional old file URL to delete.
   * @returns The final public URL to save in the database
   */
  async uploadFile(file: File, folder: string = 'documents', oldFileUrl?: string): Promise<string> {
    try {
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

      // If an old file URL was provided, delete it in the background
      if (oldFileUrl) {
        this.deleteFile(oldFileUrl).catch((err) => {
          console.error('[UploadService] Failed to delete old file:', err);
        });
      }

      return response.data.data.url;
    } catch (error) {
      console.error('[UploadService] Upload failed:', error);
      throw error;
    }
  },

  /**
   * Deletes a file from storage.
   *
   * @param fileUrl The full URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    try {
      const { data } = await publicApi.post<DeleteFileResponse>('/upload/delete', {
        fileUrl,
      });

      if (!data.success) {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('[UploadService] Delete failed:', error);
      throw error;
    }
  },
};
