import { Router } from 'express';

import {
  getSuperAdminStats,
  getAllTenants,
  createTenantManual,
  updateTenantStatus,
  updateTenantPlan,
} from '../controllers/superadmin.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { onlySuperAdmin } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(onlySuperAdmin);

router.get('/stats', getSuperAdminStats);
router.get('/tenants', getAllTenants);
router.post('/tenants', createTenantManual);
router.patch('/tenants/:tenantId/status', updateTenantStatus);
router.patch('/tenants/:tenantId/plan', updateTenantPlan);

export default router;