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
import { activityMiddleware } from '../middlewares/activity.middleware.js'

const router = Router()

router.get(
  '/batting',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('leaders_batting'),
  getBattingLeaders
)

router.get(
  '/compare/common-games',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('leaders_compare_common_games'),
  comparePlayersCommonGames
)

router.get(
  '/pitching',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('leaders_pitching'),
  getPitchingLeaders
)

router.get(
  '/fielding',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('leaders_fielding'),
  getFieldingLeaders
)

router.get(
  '/mvp/monthly',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('leaders_monthly_mvp'),
  getMonthlyMVP
)

export default router