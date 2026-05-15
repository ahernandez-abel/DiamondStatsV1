import { Router } from 'express';

import {
  getBattingLeaders,
  getPitchingLeaders,
  getFieldingLeaders,
  getMonthlyMVP,
  comparePlayersCommonGames,
} from '../controllers/leaders.controller.js';

const router = Router();

router.get('/batting', getBattingLeaders);

router.get(
  '/compare/common-games',
  comparePlayersCommonGames
);

router.get('/pitching', getPitchingLeaders);

router.get('/fielding', getFieldingLeaders);

router.get('/mvp/monthly', getMonthlyMVP);

export default router;