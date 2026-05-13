import { Router } from 'express'

import {
  getGameStats,
  savePlayerGameStats,
} from '../controllers/stats.controller.js'

const router = Router()

router.get('/game/:gameId', getGameStats)

router.post('/game/:gameId/player', savePlayerGameStats)

export default router