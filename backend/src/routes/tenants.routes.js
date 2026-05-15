import { Router } from 'express'

import {
  createTenantOnboarding,
} from '../controllers/tenants.controller.js'

const router = Router()

router.post('/onboarding', createTenantOnboarding)

export default router