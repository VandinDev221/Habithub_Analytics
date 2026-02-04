import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as ctrl from '../controllers/exportController.js';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/export/{format}:
 *   get:
 *     summary: Exportar dados (csv ou json)
 *     tags: [Export]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: format, schema: { type: string, enum: [csv, json] } }]
 *     responses:
 *       200: { description: Arquivo de exportação }
 */
router.get('/:format', ctrl.exportData);

export default router;
