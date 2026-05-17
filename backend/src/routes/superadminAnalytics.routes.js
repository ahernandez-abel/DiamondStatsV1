import { Router } from 'express';

import {
  getSuperadminOverview,
  getTenantActivity,
  getAuditLogs,
  getSystemAlerts,
  readAlert,
  resolveAlert,
  getCommercialControl,
  getSystemHealth,
} from '../controllers/superadminAnalytics.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { onlySuperAdmin } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(onlySuperAdmin);

router.get('/overview', getSuperadminOverview);

router.get('/activity', getTenantActivity);

router.get('/audit', getAuditLogs);

router.get('/alerts', getSystemAlerts);

router.patch('/alerts/:id/read', readAlert);

router.patch('/alerts/:id/resolve', resolveAlert);

router.get('/commercial', getCommercialControl);

router.get('/health', getSystemHealth);

export default router;