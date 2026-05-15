import { Router } from 'express';

import {
  getPublicHome,
} from '../controllers/public.controller.js';

const router = Router();

router.get('/:tenantSlug/home', getPublicHome);

export default router;