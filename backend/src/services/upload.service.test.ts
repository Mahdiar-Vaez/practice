import { describe, it, expect, beforeEach } from 'vitest';
import {
  UploadService,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_DOCUMENT_MIME_TYPES,
} from './upload.service.js';
import { HandleError } from '../errors/handle-error.js';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(() => {
    service = new UploadService();
  });

  describe('MIME type and file category validation', () => {
    it('should correctly identify allowed image MIME types', () => {
      for (const mime of ALLOWED_IMAGE_MIME_TYPES) {
        expect(service.isImage(mime)).toBe(true);
        expect(service.determineFileType(mime)).toBe('image');
      }
    });

    it('should correctly identify allowed document MIME types', () => {
      for (const mime of ALLOWED_DOCUMENT_MIME_TYPES) {
        expect(service.isDocument(mime)).toBe(true);
        expect(service.determineFileType(mime)).toBe('document');
      }
    });

    it('should throw HandleError for unsupported MIME types', () => {
      expect(() => service.determineFileType('audio/mp3')).toThrow(HandleError);
      expect(() => service.determineFileType('video/mp4')).toThrow(HandleError);
      expect(() => service.determineFileType('application/zip')).toThrow(
        'نوع فایل ارسال شده پشتیبانی نمی‌شود'
      );
    });
  });

  describe('validateFile', () => {
    it('should validate allowed image within 10MB limit', () => {
      const result = service.validateFile({
        mimetype: 'image/png',
        size: 5 * 1024 * 1024,
      });
      expect(result).toBe('image');
    });

    it('should validate allowed document within 25MB limit', () => {
      const result = service.validateFile({
        mimetype: 'application/pdf',
        size: 20 * 1024 * 1024,
      });
      expect(result).toBe('document');
    });

    it('should throw HandleError when image exceeds 10MB', () => {
      expect(() =>
        service.validateFile({
          mimetype: 'image/jpeg',
          size: MAX_IMAGE_SIZE + 1,
        })
      ).toThrow('حجم تصویر بیش از حد مجاز است');
    });

    it('should throw HandleError when document exceeds 25MB', () => {
      expect(() =>
        service.validateFile({
          mimetype: 'application/pdf',
          size: MAX_DOCUMENT_SIZE + 1,
        })
      ).toThrow('حجم سند بیش از حد مجاز است');
    });

    it('should throw HandleError when file is missing', () => {
      expect(() => service.validateFile(undefined)).toThrow(
        'فایلی برای اعتبارسنجی ارسال نشده است'
      );
    });
  });

  describe('Metadata handling', () => {
    it('should save and retrieve file metadata', () => {
      const saved = service.saveFileMetadata({
        filename: 'test-123.jpg',
        originalName: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        type: 'image',
        url: '/uploads/test-123.jpg',
        userId: 'user-1',
      });

      expect(saved.id).toBeDefined();
      expect(saved.filename).toBe('test-123.jpg');
      expect(saved.type).toBe('image');
      expect(saved.createdAt).toBeDefined();

      const foundByFilename = service.getFileMetadata('test-123.jpg');
      expect(foundByFilename).toEqual(saved);

      const foundById = service.getFileMetadata(saved.id);
      expect(foundById).toEqual(saved);
    });

    it('should delete metadata', () => {
      const saved = service.saveFileMetadata({
        filename: 'file-to-delete.pdf',
        originalName: 'doc.pdf',
        mimetype: 'application/pdf',
        size: 2048,
        type: 'document',
        url: '/uploads/file-to-delete.pdf',
      });

      expect(service.deleteMetadata(saved.filename)).toBe(true);
      expect(service.getFileMetadata(saved.filename)).toBeUndefined();
    });
  });
});
