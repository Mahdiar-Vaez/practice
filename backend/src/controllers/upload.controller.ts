import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Response, NextFunction } from 'express';
import multer from 'multer';
import {
  uploadService,
  MAX_DOCUMENT_SIZE,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_DOCUMENT_MIME_TYPES,
} from '../services/upload.service.js';
import { HandleError } from '../errors/handle-error.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target upload directory: backend/public/uploads
export const UPLOAD_DIR = path.resolve(__dirname, '../../public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// Multer file filter validating allowed MIME types
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = [
    ...ALLOWED_IMAGE_MIME_TYPES,
    ...ALLOWED_DOCUMENT_MIME_TYPES,
  ];

  if (!allowed.includes(file.mimetype as any)) {
    return cb(
      HandleError.badRequest('نوع فایل ارسال شده پشتیبانی نمی‌شود. تنها تصاویر و اسناد مجاز هستند')
    );
  }

  cb(null, true);
};

// Configured multer instance with 25MB file size limit and fileFilter
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE, // 25MB maximum limit
  },
});

export class UploadController {
  async uploadFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        throw HandleError.badRequest('لطفاً یک فایل برای بارگذاری انتخاب کنید');
      }

      // Validate file type & size using uploadService
      let fileType: 'image' | 'document';
      try {
        fileType = uploadService.validateFile({
          mimetype: file.mimetype,
          size: file.size,
        });
      } catch (validationError) {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw validationError;
      }

      const isImage = fileType === 'image';
      const fileUrl = `/uploads/${file.filename}`;

      // Save file metadata
      uploadService.saveFileMetadata({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        type: isImage ? 'image' : 'document',
        url: fileUrl,
        userId: req.user?.userId,
      });

      return res.status(200).json({
        success: true,
        message: 'فایل با موفقیت بارگذاری شد',
        data: {
          url: fileUrl,
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          type: isImage ? 'image' : 'document',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
