import api from '@/lib/api';
import { ApiResponse } from '@/types/api';

export interface UploadFileData {
  url: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  type: 'image' | 'document';
}

export interface UploadResponse extends ApiResponse<UploadFileData>, Partial<UploadFileData> {}

export const uploadService = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post<ApiResponse<UploadFileData>>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const payload = res.data;
    if (payload && payload.data) {
      Object.assign(payload, payload.data);
    }

    return payload as UploadResponse;
  },
};

export default uploadService;
