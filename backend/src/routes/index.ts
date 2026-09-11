import { Router } from 'express';
import authRoutes from './auth.routes.js';
import tweetRoutes from './tweet.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tweets', tweetRoutes);


router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

export default router;
