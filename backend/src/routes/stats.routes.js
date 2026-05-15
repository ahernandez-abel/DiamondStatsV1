import { Router } from 'express';

import {
  getGameStats,
  savePlayerGameStats,
  getPlayerGameStats,
} from '../controllers/stats.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.get('/game/:gameId', getGameStats);

router.post(
  '/game/:gameId/player',
  authMiddleware,
  tenantMiddleware,
  savePlayerGameStats
);

router.get(
  '/games/:gameId/player/:playerId',
  getPlayerGameStats
);

export default router;