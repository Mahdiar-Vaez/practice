import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { userRepository } from '../repositories/mock-user.repository.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const authService = new AuthService(userRepository);

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'ورود با موفقیت انجام شد',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'ثبت‌نام با موفقیت انجام شد',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await authService.getProfile(userId);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
