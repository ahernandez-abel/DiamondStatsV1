import { Router } from 'express'

import {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../controllers/players.controller.js'

import { authMiddleware } from '../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../middlewares/tenant.middleware.js'
import { activityMiddleware } from '../middlewares/activity.middleware.js'

const router = Router()

router.get(
  '/',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('players_view'),
  getPlayers
)

router.get(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('player_detail'),
  getPlayerById
)

router.post(
  '/',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('player_create'),
  createPlayer
)

router.put(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('player_update'),
  updatePlayer
)

router.delete(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('player_delete'),
  deletePlayer
)

export default router