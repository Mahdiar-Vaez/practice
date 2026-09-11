import { Request, Response, NextFunction } from 'express';
import { HandleError } from '../errors/handle-error.js';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HandleError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'خطای داخلی سرور رخ داده است';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
