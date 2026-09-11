import crypto from 'node:crypto';
import { HandleError } from '../errors/handle-error.js';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB

export type UploadFileType = 'image' | 'document';

export interface UploadedFileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  type: UploadFileType;
  url: string;
  userId?: string;
  createdAt: string;
}

export interface SaveMetadataDTO {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  type: UploadFileType;
  url: string;
  userId?: string;
}

export class UploadService {
  private metadataStore: Map<string, UploadedFileMetadata> = new Map();

  isImage(mimetype: string): boolean {
    return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimetype);
  }

  isDocument(mimetype: string): boolean {
    return (ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(mimetype);
  }

  isAllowedMimeType(mimetype: string): boolean {
    return this.isImage(mimetype) || this.isDocument(mimetype);
  }

  determineFileType(mimetype: string): UploadFileType {
    if (this.isImage(mimetype)) {
      return 'image';
    }
    if (this.isDocument(mimetype)) {
      return 'document';
    }
    throw HandleError.badRequest('نوع فایل ارسال شده پشتیبانی نمی‌شود. تنها تصاویر و اسناد مجاز هستند');
  }

  validateFile(file?: { mimetype?: string; size?: number }): UploadFileType {
    if (!file || !file.mimetype) {
      throw HandleError.badRequest('فایلی برای اعتبارسنجی ارسال نشده است');
    }

    const type = this.determineFileType(file.mimetype);

    if (file.size !== undefined) {
      if (type === 'image' && file.size > MAX_IMAGE_SIZE) {
        throw HandleError.badRequest('حجم تصویر بیش از حد مجاز است. حداکثر حجم مجاز برای تصویر ۱۰ مگابایت است');
      }
      if (type === 'document' && file.size > MAX_DOCUMENT_SIZE) {
        throw HandleError.badRequest('حجم سند بیش از حد مجاز است. حداکثر حجم مجاز برای سند ۲۵ مگابایت است');
      }
    }

    return type;
  }

  saveFileMetadata(data: SaveMetadataDTO): UploadedFileMetadata {
    const id = crypto.randomUUID ? crypto.randomUUID() : `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const metadata: UploadedFileMetadata = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.metadataStore.set(metadata.filename, metadata);
    return metadata;
  }

  getFileMetadata(filenameOrId: string): UploadedFileMetadata | undefined {
    const byFilename = this.metadataStore.get(filenameOrId);
    if (byFilename) return byFilename;
    for (const item of this.metadataStore.values()) {
      if (item.id === filenameOrId) return item;
    }
    return undefined;
  }

  getAllMetadata(): UploadedFileMetadata[] {
    return Array.from(this.metadataStore.values());
  }

  deleteMetadata(filenameOrId: string): boolean {
    const item = this.getFileMetadata(filenameOrId);
    if (!item) return false;
    return this.metadataStore.delete(item.filename);
  }

  clearMetadata(): void {
    this.metadataStore.clear();
  }
}

export const uploadService = new UploadService();
