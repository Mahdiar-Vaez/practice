import { Request, Response, NextFunction } from 'express';
import { searchService, SearchService } from '../services/search.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export class SearchController {
  constructor(private service: SearchService = searchService) {}

  async search(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const userId = req.user?.userId;
      const result = await this.service.search(q, userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHashtag(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tag = req.params.tag || '';
      const userId = req.user?.userId;
      const tweets = await this.service.getHashtagTweets(tag, userId);
      res.status(200).json({
        success: true,
        data: { tweets },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const hashtags = await this.service.getTrendingHashtags();
      res.status(200).json({
        success: true,
        data: {
          hashtags,
          trending: hashtags,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController(searchService);
