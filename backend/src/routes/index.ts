import { Router } from 'express';
import habits from './habits.js';
import auth from './auth.js';
import analytics from './analytics.js';
import ai from './ai.js';
import exportRoutes from './export.js';

const router = Router();

router.use('/habits', habits);
router.use('/auth', auth);
router.use('/analytics', analytics);
router.use('/ai', ai);
router.use('/export', exportRoutes);

export default router;
