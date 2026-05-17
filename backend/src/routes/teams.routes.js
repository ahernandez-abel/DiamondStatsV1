import { Router } from 'express'

import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} from '../controllers/teams.controller.js'

import { authMiddleware } from '../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../middlewares/tenant.middleware.js'
import { activityMiddleware } from '../middlewares/activity.middleware.js'

const router = Router()

router.get(
  '/',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('teams_view'),
  getTeams
)

router.get(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('team_detail'),
  getTeamById
)

router.post(
  '/',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('team_create'),
  createTeam
)

router.put(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('team_update'),
  updateTeam
)

router.delete(
  '/:id',
  authMiddleware,
  tenantMiddleware,
  activityMiddleware('team_delete'),
  deleteTeam
)

export default router