import { Router } from 'express'

import {
  getGameStats,
  savePlayerGameStats,
  getPlayerGameStats,
} from '../controllers/stats.controller.js'

const router = Router()

router.get('/game/:gameId', getGameStats)

router.post('/game/:gameId/player', savePlayerGameStats)
router.get(
  '/games/:gameId/player/:playerId',
  getPlayerGameStats
)

export default router