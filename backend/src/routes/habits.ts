import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as ctrl from '../controllers/habitsController.js';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/habits:
 *   get:
 *     summary: Listar hábitos do usuário
 *     tags: [Habits]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de hábitos }
 */
router.get('/', ctrl.listHabits);

/**
 * @openapi
 * /api/habits:
 *   post:
 *     summary: Criar novo hábito
 *     tags: [Habits]
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { content: { application/json: { schema: { type: object, properties: { name: {}, category: {}, color: {}, goal: {}, reminder_time: {} } } } } }
 *     responses:
 *       201: { description: Hábito criado }
 */
router.post('/', ctrl.createHabit);

/**
 * @openapi
 * /api/habits/:id:
 *   put:
 *     summary: Atualizar hábito
 *     tags: [Habits]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody: { content: { application/json: { schema: { type: object } } } }
 *     responses:
 *       200: { description: Hábito atualizado }
 *       404: { description: Hábito não encontrado }
 */
router.put('/:id', ctrl.updateHabit);

/**
 * @openapi
 * /api/habits/:id:
 *   delete:
 *     summary: Remover hábito
 *     tags: [Habits]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       204: { description: Removido }
 *       404: { description: Hábito não encontrado }
 */
router.delete('/:id', ctrl.deleteHabit);

/**
 * @openapi
 * /api/habits/:id/log:
 *   post:
 *     summary: Registrar check-in
 *     tags: [Habits]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody: { content: { application/json: { schema: { type: object, properties: { date: {}, completed: {}, mood: {}, notes: {} } } } } }
 *     responses:
 *       201: { description: Log criado/atualizado }
 */
router.post('/:id/log', ctrl.addLog);

/**
 * @openapi
 * /api/habits/:id/logs:
 *   get:
 *     summary: Listar logs do hábito
 *     tags: [Habits]
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id }, { in: query, name: from }, { in: query, name: to }]
 *     responses:
 *       200: { description: Lista de logs }
 */
router.get('/:id/logs', ctrl.getLogs);

export default router;
