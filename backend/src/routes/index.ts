import { Router } from 'express';
import authRoutes from './auth.routes.js';
import tweetRoutes from './tweet.routes.js';
import userRoutes from './user.routes.js';
import uploadRoutes from './upload.routes.js';
import searchRoutes from './search.routes.js';
import chatRoutes from './chat.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tweets', tweetRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/search', searchRoutes);
router.use('/chats', chatRoutes);


router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

export default router;
