import { Router } from 'express'

import {
  getBattingLeaders,
  getPitchingLeaders,
  getFieldingLeaders,
  getMonthlyMVP,
} from '../controllers/leaders.controller.js'

const router = Router()

router.get('/batting', getBattingLeaders)

router.get('/pitching', getPitchingLeaders)

router.get('/fielding', getFieldingLeaders)

router.get('/mvp/monthly', getMonthlyMVP)

export default router