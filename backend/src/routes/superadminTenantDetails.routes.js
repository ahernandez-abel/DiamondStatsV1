import { Router } from 'express';

import {
  getSuperadminTenantDetail,
  updateTenantPrivacy,
  regenerateTenantAccessCode,
  updateTenantAdvancedStatus,
} from '../controllers/superadminTenantDetails.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { onlySuperAdmin } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(onlySuperAdmin);

router.get('/:tenantId', getSuperadminTenantDetail);
router.patch('/:tenantId/privacy', updateTenantPrivacy);
router.patch('/:tenantId/access-code/regenerate', regenerateTenantAccessCode);
router.patch('/:tenantId/status', updateTenantAdvancedStatus);

export default router;