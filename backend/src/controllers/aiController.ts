import type { Request, Response, NextFunction } from 'express';
import { pgPool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import { buildAskContext, validateQuestion, askLLM } from '../services/aiService.js';

/**
 * Gera insights simples baseados no histórico (sem API externa).
 * Em produção pode integrar OpenAI ou ml-service.
 */
export async function getInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { rows: logs } = await pgPool.query(
      `SELECT hl.date, hl.completed, hl.mood, EXTRACT(DOW FROM hl.date) as dow, EXTRACT(HOUR FROM hl.created_at) as hour
       FROM habit_logs hl
       JOIN habits h ON h.id = hl.habit_id
       WHERE h.user_id = $1 AND hl.date >= CURRENT_DATE - INTERVAL '30 days'`,
      [userId]
    );

    const byDow: Record<number, { total: number; completed: number }> = {};
    for (let i = 0; i < 7; i++) byDow[i] = { total: 0, completed: 0 };
    for (const l of logs) {
      const d = Number(l.dow);
      byDow[d].total++;
      if (l.completed) byDow[d].completed++;
    }

    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const bestDay = Object.entries(byDow)
      .filter(([, v]) => v.total >= 3)
      .map(([d, v]) => ({ day: dayNames[Number(d)], rate: v.total ? (v.completed / v.total) * 100 : 0 }))
      .sort((a, b) => b.rate - a.rate)[0];

    const total = logs.length;
    const completed = logs.filter((l) => l.completed).length;
    const prob = total > 0 ? Math.round((completed / total) * 100) : 50;

    const insights: string[] = [];
    if (bestDay) insights.push(`Você tem mais sucesso às ${bestDay.day}s (${Math.round(bestDay.rate)}% de conclusão).`);
    insights.push(`Com base nos últimos 30 dias, a probabilidade estimada de sucesso é ${prob}%.`);
    if (prob >= 70) insights.push('Recomendação: mantenha o horário e o contexto que estão funcionando.');
    else insights.push('Recomendação: tente fixar um horário fixo (ex: 9h) para os hábitos mais importantes.');

    res.json({
      successProbability: prob,
      insights,
      bestDay: bestDay?.day ?? null,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Pergunta em texto livre sobre os hábitos do usuário; responde com LLM usando contexto (hábitos + logs + stats).
 */
export async function askQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const question = validateQuestion(req.body);
    const context = await buildAskContext(userId);
    const answer = await askLLM(context, question);
    res.json({ answer });
  } catch (e) {
    if (e instanceof AppError) return next(e);
    console.error('AI ask error:', e);
    const msg = e instanceof Error ? e.message : 'Erro desconhecido';
    const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('billing');
    const friendlyMessage = isQuota
      ? 'Cota da API de IA excedida. Verifique plano e cobrança em platform.openai.com ou use outra chave.'
      : process.env.NODE_ENV === 'production'
        ? 'Falha ao contactar o serviço de IA. Tente novamente.'
        : msg;
    next(new AppError(502, friendlyMessage));
  }
}
