import { Router } from 'express';
import { searchController } from '../controllers/search.controller.js';
import { optionalAuthenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalAuthenticate, (req, res, next) => searchController.search(req, res, next));
router.get('/trending', optionalAuthenticate, (req, res, next) => searchController.getTrending(req, res, next));
router.get('/hashtags/:tag', optionalAuthenticate, (req, res, next) => searchController.getHashtag(req, res, next));

export default router;
