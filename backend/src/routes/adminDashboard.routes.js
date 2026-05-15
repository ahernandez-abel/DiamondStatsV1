import { Router } from 'express'

import {
  getAdminDashboard,
} from '../controllers/adminDashboard.controller.js'

import { authMiddleware } from '../middlewares/auth.middleware.js'
import { tenantMiddleware } from '../middlewares/tenant.middleware.js'

const router = Router()

router.get(
  '/dashboard',
  authMiddleware,
  tenantMiddleware,
  getAdminDashboard
)

export default router