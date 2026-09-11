import { Request, Response, NextFunction } from 'express';
import { TweetService } from '../services/tweet.service.js';
import { tweetRepository } from '../repositories/mock-tweet.repository.js';
import { userRepository } from '../repositories/mock-user.repository.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const tweetService = new TweetService(tweetRepository, userRepository);

export class TweetController {
  async getFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const tweets = await tweetService.getFeed(userId);
      res.status(200).json({ success: true, data: { tweets } });
    } catch (error) {
      next(error);
    }
  }

  async createTweet(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const tweet = await tweetService.createTweet(userId, req.body);
      res.status(201).json({ success: true, message: 'پست با موفقیت ایجاد شد', data: { tweet } });
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const tweetId = req.params.id;
      const result = await tweetService.toggleLike(tweetId, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const tweetId = req.params.id;
      const comments = await tweetService.getComments(tweetId);
      res.status(200).json({ success: true, data: { comments } });
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const tweetId = req.params.id;
      const comment = await tweetService.addComment(tweetId, userId, req.body);
      res.status(201).json({ success: true, message: 'پاسخ با موفقیت ثبت شد', data: { comment } });
    } catch (error) {
      next(error);
    }
  }
}

export const tweetController = new TweetController();
