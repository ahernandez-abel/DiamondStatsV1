import { Router } from 'express'

import {
  getBattingLeaders,
  getPitchingLeaders,
  getFieldingLeaders,
  getMonthlyMVP,
  comparePlayersCommonGames,
} from '../controllers/leaders.controller.js'

import { authMiddleware } from '../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../middlewares/tenant.middleware.js'

const router = Router()

router.get('/batting', authMiddleware, tenantMiddleware, getBattingLeaders)

router.get(
  '/compare/common-games',
  authMiddleware,
  tenantMiddleware,
  comparePlayersCommonGames
)

router.get('/pitching', authMiddleware, tenantMiddleware, getPitchingLeaders)

router.get('/fielding', authMiddleware, tenantMiddleware, getFieldingLeaders)

router.get('/mvp/monthly', authMiddleware, tenantMiddleware, getMonthlyMVP)

export default router