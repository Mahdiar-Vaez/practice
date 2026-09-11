import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { userRepository } from '../repositories/mock-user.repository.js';
import { tweetRepository } from '../repositories/mock-tweet.repository.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const userService = new UserService(userRepository, tweetRepository);

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const targetId = req.params.id || req.user?.userId;
      if (!targetId) {
        return res.status(400).json({ success: false, message: 'شناسه کاربر نامعتبر است' });
      }
      const profile = await userService.getProfile(targetId);
      res.status(200).json({ success: true, data: { user: profile } });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const updatedUser = await userService.updateProfile(userId, req.body);
      res.status(200).json({
        success: true,
        message: 'مشخصات پروفایل با موفقیت به‌روزرسانی شد',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await userService.deleteAccount(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserTweets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const targetId = req.params.id;
      const currentUserId = req.user?.userId;
      const tweets = await userService.getUserTweets(targetId, currentUserId);
      res.status(200).json({ success: true, data: { tweets } });
    } catch (error) {
      next(error);
    }
  }

  async getUserLikes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const targetId = req.params.id;
      const currentUserId = req.user?.userId;
      const tweets = await userService.getUserLikes(targetId, currentUserId);
      res.status(200).json({ success: true, data: { tweets } });
    } catch (error) {
      next(error);
    }
  }

  async getUserComments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const targetId = req.params.id;
      const comments = await userService.getUserComments(targetId);
      res.status(200).json({ success: true, data: { comments } });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
