import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as ctrl from '../controllers/analyticsController.js';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/analytics:
 *   get:
 *     summary: Dados para gráficos e dashboard
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: query, name: from }, { in: query, name: to }]
 *     responses:
 *       200: { description: Dados agregados }
 */
router.get('/', ctrl.getAnalytics);

export default router;
