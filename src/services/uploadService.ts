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
   * Uploads a file using the pre-signed URL approach.
   *
   * @param file The literal File object to upload
   * @param folder The folder path to store the file in (e.g. 'profile_pictures')
   * @param oldFileUrl Optional old file URL to delete.
   * @returns The final public URL to save in the database
   */
  async uploadFile(file: File, folder: string, oldFileUrl?: string): Promise<string> {
    try {
      // 1. Get the pre-signed URL
      const { data: presignedData } = await publicApi.post<UploadPresignedUrlResponse>('/upload/presigned-url', {
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        folder,
        fileSize: file.size,
      });

      if (!presignedData.success || !presignedData.data) {
        throw new Error('Failed to get presigned URL from backend');
      }

      const { presignedUrl, finalUrl } = presignedData.data;

      // 2. Upload file directly to the presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file to storage: ${uploadResponse.statusText}`);
      }

      // 3. Delete the old file if provided
      if (oldFileUrl) {
        // Run delete asynchronously in the background so it doesn't block the upload process
        this.deleteFile(oldFileUrl).catch((err) => {
          console.error('[UploadService] Failed to delete old file:', err);
        });
      }

      // 4. Return the new final URL to save into the DB
      return finalUrl;
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
