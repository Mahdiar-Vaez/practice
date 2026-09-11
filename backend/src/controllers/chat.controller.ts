import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { chatService } from '../services/chat.service.js';

export class ChatController {
  async getConversations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const conversations = await chatService.getConversations(userId);
      res.status(200).json({
        success: true,
        data: { conversations },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const targetId = req.params.targetId;
      const messages = await chatService.getMessages(userId, targetId);
      res.status(200).json({
        success: true,
        data: { messages },
      });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const targetId = req.params.targetId;
      const { content, mediaUrl, documentUrl, documentName } = req.body;

      const message = await chatService.sendMessage(userId, {
        receiverId: targetId,
        content,
        mediaUrl,
        documentUrl,
        documentName,
      });

      res.status(201).json({
        success: true,
        message: 'پیام با موفقیت ارسال شد',
        data: { message },
      });
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const targetId = req.params.targetId;
      await chatService.markRead(userId, targetId);
      res.status(200).json({
        success: true,
        message: 'پیام‌ها خوانده شدند',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
