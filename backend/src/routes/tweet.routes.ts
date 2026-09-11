import { Router } from 'express';
import { tweetController } from '../controllers/tweet.controller.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTweetSchema, createCommentSchema } from '../validations/tweet.validation.js';

const router = Router();

router.get('/', optionalAuthenticate, (req, res, next) => tweetController.getFeed(req, res, next));
router.post('/', authenticate, validate(createTweetSchema), (req, res, next) => tweetController.createTweet(req, res, next));
router.post('/:id/like', authenticate, (req, res, next) => tweetController.toggleLike(req, res, next));
router.get('/:id/comments', (req, res, next) => tweetController.getComments(req, res, next));
router.post('/:id/comments', authenticate, validate(createCommentSchema), (req, res, next) => tweetController.addComment(req, res, next));

export default router;
