import { Router } from 'express';

import {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../controllers/players.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getPlayers);

router.get('/:id', getPlayerById);

router.post('/', authMiddleware, createPlayer);

router.put('/:id', authMiddleware, updatePlayer);

router.delete('/:id', authMiddleware, deletePlayer);

export default router;