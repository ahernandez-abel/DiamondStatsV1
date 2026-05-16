import { Router } from 'express';

import {
  getPlans,
  createPlan,
  updatePlan,
  getBillingTenants,
  changeTenantPlan,
  registerManualPayment,
  getTenantPayments,
} from '../controllers/billing.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { onlySuperAdmin } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(onlySuperAdmin);

router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.patch('/plans/:planId', updatePlan);

router.get('/tenants', getBillingTenants);
router.patch('/tenants/:tenantId/plan', changeTenantPlan);

router.post('/tenants/:tenantId/payments', registerManualPayment);
router.get('/tenants/:tenantId/payments', getTenantPayments);

export default router;