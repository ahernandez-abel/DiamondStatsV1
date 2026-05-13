import { Router } from 'express';

import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} from '../controllers/teams.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getTeams);

router.get('/:id', getTeamById);

router.post('/', authMiddleware, createTeam);

router.put('/:id', authMiddleware, updateTeam);

router.delete('/:id', authMiddleware, deleteTeam);

export default router;