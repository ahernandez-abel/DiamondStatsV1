import { Router } from 'express';

import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} from '../controllers/teams.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { tenantMiddleware } from '../middlewares/tenant.middleware.js';

const router = Router();

router.get('/', getTeams);

router.get('/:id', getTeamById);

router.post('/', authMiddleware, tenantMiddleware, createTeam);

router.put('/:id', authMiddleware, tenantMiddleware, updateTeam);

router.delete('/:id', authMiddleware, tenantMiddleware, deleteTeam);

export default router;