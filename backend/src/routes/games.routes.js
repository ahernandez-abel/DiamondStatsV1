import { Router } from 'express';

import {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  updateGameResult,
} from '../controllers/games.controller.js';

const router = Router();

router.get('/', getGames);

router.get('/:id', getGameById);

router.post('/', createGame);

router.put('/:id', updateGame);

router.delete('/:id', deleteGame);

router.patch('/:id/result', updateGameResult);

export default router;