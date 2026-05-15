import { Router } from 'express';

import {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../controllers/players.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.get('/', authMiddleware, tenantMiddleware, getPlayers);

router.get('/:id', authMiddleware, tenantMiddleware, getPlayerById);

router.post('/', authMiddleware, tenantMiddleware, createPlayer);

router.put('/:id', authMiddleware, tenantMiddleware, updatePlayer);

router.delete('/:id', authMiddleware, tenantMiddleware, deletePlayer);

export default router;