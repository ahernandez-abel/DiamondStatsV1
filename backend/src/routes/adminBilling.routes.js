import { Router } from 'express';

import {
  getMyBilling,
} from '../controllers/adminBilling.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { onlyTenantAdmin } from '../middlewares/role.middleware.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  onlyTenantAdmin,
  getMyBilling
);

export default router;