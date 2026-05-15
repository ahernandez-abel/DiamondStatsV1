import { Router } from 'express';

import {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  updateGameResult,
} from '../controllers/games.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.get('/', authMiddleware, tenantMiddleware, getGames);

router.get('/:id', authMiddleware, tenantMiddleware, getGameById);

router.post('/', authMiddleware, tenantMiddleware, createGame);

router.put('/:id', authMiddleware, tenantMiddleware, updateGame);

router.delete('/:id', authMiddleware, tenantMiddleware, deleteGame);

router.patch('/:id/result', authMiddleware, tenantMiddleware, updateGameResult);

export default router;