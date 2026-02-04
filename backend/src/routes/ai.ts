import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as ctrl from '../controllers/aiController.js';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/ai/insights:
 *   post:
 *     summary: Gerar insights com IA (baseado em histórico)
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Insights e probabilidade de sucesso }
 */
router.post('/insights', ctrl.getInsights);

/**
 * @openapi
 * /api/ai/ask:
 *   post:
 *     summary: Perguntar sobre seus hábitos (LLM com contexto)
 *     tags: [AI]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { type: object, properties: { question: { type: string } }, required: [question] }
 *     responses:
 *       200: { description: Resposta da IA }
 *       400: { description: Pergunta inválida }
 */
router.post('/ask', ctrl.askQuestion);

export default router;
