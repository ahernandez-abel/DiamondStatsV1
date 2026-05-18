import { Router } from 'express';

import {
  getSuperadminTenantDetail,
  updateTenantPrivacy,
  regenerateTenantAccessCode,
  updateTenantAdvancedStatus,

  updateTenantUserBySuperAdmin,
  changeTenantUserPasswordBySuperAdmin,
  deleteTenantUserBySuperAdmin,
} from '../controllers/superadminTenantDetails.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { onlySuperAdmin } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(onlySuperAdmin);

router.get(
  '/:tenantId',
  getSuperadminTenantDetail
);

router.patch(
  '/:tenantId/privacy',
  updateTenantPrivacy
);

router.patch(
  '/:tenantId/access-code/regenerate',
  regenerateTenantAccessCode
);

router.patch(
  '/:tenantId/status',
  updateTenantAdvancedStatus
);

router.patch(
  '/:tenantId/users/:userId',
  updateTenantUserBySuperAdmin
);

router.patch(
  '/:tenantId/users/:userId/password',
  changeTenantUserPasswordBySuperAdmin
);

router.delete(
  '/:tenantId/users/:userId',
  deleteTenantUserBySuperAdmin
);

export default router;