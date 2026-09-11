import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload, uploadController } from '../controllers/upload.controller.js';
import { HandleError } from '../errors/handle-error.js';

const router = Router();

// Middleware using multer single('file') with MulterError translation to Persian HandleError
const uploadSingleFile = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(
            HandleError.badRequest('حجم فایل بیش از حد مجاز است. حداکثر حجم مجاز ۲۵ مگابایت است')
          );
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(
            HandleError.badRequest('فیلد ارسال فایل باید "file" باشد')
          );
        }
        return next(HandleError.badRequest(`خطا در بارگذاری فایل: ${err.message}`));
      }
      return next(err);
    }
    next();
  });
};

router.post(
  '/',
  authenticate,
  uploadSingleFile,
  (req, res, next) => uploadController.uploadFile(req, res, next)
);

export default router;
