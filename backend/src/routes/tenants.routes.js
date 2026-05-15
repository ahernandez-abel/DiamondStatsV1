import { Router } from 'express';

import {
  createTenantOnboarding,
} from '../controllers/tenants.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/onboarding', authMiddleware, createTenantOnboarding);

export default router;