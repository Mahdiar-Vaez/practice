import { Router } from 'express';
import { chatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

router.get('/', (req, res, next) => chatController.getConversations(req, res, next));
router.get('/:targetId/messages', (req, res, next) => chatController.getMessages(req, res, next));
router.post('/:targetId/messages', (req, res, next) => chatController.sendMessage(req, res, next));
router.post('/:targetId/read', (req, res, next) => chatController.markRead(req, res, next));

export default router;
