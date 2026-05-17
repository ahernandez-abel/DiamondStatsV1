import { Router } from 'express'

import {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  updateGameResult,
} from '../controllers/games.controller.js'

import { authMiddleware } from '../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../middlewares/tenant.middleware.js'
import { activityMiddleware } from '../middlewares/activity.middleware.js'

const router = Router()

router.get(
  '/',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('games_view'),
  getGames
)

router.get(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('game_detail'),
  getGameById
)

router.post(
  '/',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('game_create'),
  createGame
)

router.put(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('game_update'),
  updateGame
)

router.delete(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('game_delete'),
  deleteGame
)

router.patch(
  '/:id/result',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('game_result_update'),
  updateGameResult
)

export default router