import { Router } from 'express'

import {
  getPublicHome,
  getTeamAccess,
} from '../controllers/public.controller.js'

import {
  getPlayers,
  getPlayerById,
} from '../controllers/players.controller.js'

import {
  getTeams,
  getTeamById,
} from '../controllers/teams.controller.js'

import {
  getGames,
  getGameById,
} from '../controllers/games.controller.js'

import {
  getBattingLeaders,
  getPitchingLeaders,
  getFieldingLeaders,
  getMonthlyMVP,
  comparePlayersCommonGames,
} from '../controllers/leaders.controller.js'

import { pool } from '../config/db.js'

const router = Router()

const publicTenantMiddleware = async (req, res, next) => {
  try {
    const { tenantSlug } = req.params

    const result = await pool.query(
      `
      SELECT id, name, slug, status
      FROM tenants
      WHERE slug = $1
      AND status = 'active'
      LIMIT 1
      `,
      [tenantSlug]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Tenant público no encontrado',
      })
    }

    req.tenantId = result.rows[0].id
    req.tenant = result.rows[0]

    next()
  } catch (error) {
    next(error)
  }
}

router.get('/:tenantSlug/home', getPublicHome)
router.get('/team-access/:code', getTeamAccess)

router.get('/:tenantSlug/players', publicTenantMiddleware, getPlayers)
router.get('/:tenantSlug/players/:id', publicTenantMiddleware, getPlayerById)

router.get('/:tenantSlug/teams', publicTenantMiddleware, getTeams)
router.get('/:tenantSlug/teams/:id', publicTenantMiddleware, getTeamById)

router.get('/:tenantSlug/games', publicTenantMiddleware, getGames)
router.get('/:tenantSlug/games/:id', publicTenantMiddleware, getGameById)

router.get('/:tenantSlug/leaders/batting', publicTenantMiddleware, getBattingLeaders)
router.get('/:tenantSlug/leaders/pitching', publicTenantMiddleware, getPitchingLeaders)
router.get('/:tenantSlug/leaders/fielding', publicTenantMiddleware, getFieldingLeaders)
router.get('/:tenantSlug/leaders/mvp/monthly', publicTenantMiddleware, getMonthlyMVP)

router.get(
  '/:tenantSlug/leaders/compare/common-games',
  publicTenantMiddleware,
  comparePlayersCommonGames
)

export default router