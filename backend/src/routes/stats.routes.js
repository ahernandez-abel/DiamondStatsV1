import { Router } from 'express'

import {
  getGameStats,
  savePlayerGameStats,
  getPlayerGameStats,
} from '../controllers/stats.controller.js'

import { authMiddleware } from '../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../middlewares/tenant.middleware.js'
import { activityMiddleware } from '../middlewares/activity.middleware.js'

const router = Router()

router.get(
  '/game/:gameId',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('game_stats_view'),
  getGameStats
)

router.post(
  '/game/:gameId/player',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('player_stats_save'),
  savePlayerGameStats
)

router.get(
  '/games/:gameId/player/:playerId',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('player_game_stats_view'),
  getPlayerGameStats
)

export default router