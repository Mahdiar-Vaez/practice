import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalAuthenticate, (req, res, next) => userController.getUsers(req, res, next));
router.get('/profile', authenticate, (req, res, next) => userController.getProfile(req, res, next));
router.get('/:id/profile', optionalAuthenticate, (req, res, next) => userController.getProfile(req, res, next));
router.put('/profile', authenticate, (req, res, next) => userController.updateProfile(req, res, next));
router.delete('/account', authenticate, (req, res, next) => userController.deleteAccount(req, res, next));
router.get('/:id/tweets', optionalAuthenticate, (req, res, next) => userController.getUserTweets(req, res, next));
router.get('/:id/likes', optionalAuthenticate, (req, res, next) => userController.getUserLikes(req, res, next));
router.get('/:id/comments', optionalAuthenticate, (req, res, next) => userController.getUserComments(req, res, next));

export default router;
