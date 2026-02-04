import { pgPool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';
import OpenAI from 'openai';

const MAX_QUESTION_LENGTH = 500;
const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export interface AskContext {
  habitsSummary: string;
  statsSummary: string;
  recentSummary: string;
}

/**
 * Monta o contexto do usuário (hábitos, estatísticas, últimos 30 dias) para o LLM.
 */
export async function buildAskContext(userId: string): Promise<AskContext> {
  const [habitsResult, logsResult] = await Promise.all([
    pgPool.query<{ name: string; category: string | null }>(
      'SELECT name, category FROM habits WHERE user_id = $1 ORDER BY name',
      [userId]
    ),
    pgPool.query<{ habit_name: string; date: string; completed: boolean; mood: string | null }>(
      `SELECT h.name as habit_name, hl.date, hl.completed, hl.mood
       FROM habit_logs hl
       JOIN habits h ON h.id = hl.habit_id
       WHERE h.user_id = $1 AND hl.date >= CURRENT_DATE - INTERVAL '30 days'
       ORDER BY hl.date DESC`,
      [userId]
    ),
  ]);

  const habits = habitsResult.rows;
  const logs = logsResult.rows;

  const habitsSummary =
    habits.length === 0
      ? 'O usuário ainda não cadastrou hábitos.'
      : `Hábitos: ${habits.map((h: { name: string; category: string | null }) => `${h.name}${h.category ? ` (${h.category})` : ''}`).join(', ')}.`;

  const byHabit: Record<string, { total: number; completed: number; moods: string[] }> = {};
  for (const log of logs) {
    if (!byHabit[log.habit_name]) byHabit[log.habit_name] = { total: 0, completed: 0, moods: [] };
    byHabit[log.habit_name].total++;
    if (log.completed) byHabit[log.habit_name].completed++;
    if (log.mood) byHabit[log.habit_name].moods.push(log.mood);
  }

  const byDow: Record<number, { total: number; completed: number }> = {};
  for (let i = 0; i < 7; i++) byDow[i] = { total: 0, completed: 0 };
  for (const l of logs as { date: string; completed: boolean }[]) {
    const d = new Date(l.date).getDay();
    byDow[d].total++;
    if (l.completed) byDow[d].completed++;
  }
  const bestDayEntry = Object.entries(byDow)
    .filter(([, v]) => v.total >= 2)
    .map(([d, v]) => ({ day: DAY_NAMES[Number(d)], rate: v.total ? (v.completed / v.total) * 100 : 0 }))
    .sort((a, b) => b.rate - a.rate)[0];

  const totalLogs = logs.length;
  const completedLogs = logs.filter((l: { completed: boolean }) => l.completed).length;
  const successRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

  let currentStreak = 0;
  const today = new Date().toISOString().slice(0, 10);
  const completedDates = new Set(logs.filter((l: { completed: boolean }) => l.completed).map((l: { date: string }) => l.date));
  for (let d = new Date(today); ; d.setDate(d.getDate() - 1)) {
    const ds = d.toISOString().slice(0, 10);
    if (completedDates.has(ds)) currentStreak++;
    else break;
  }

  const statsSummary =
    `Estatísticas (últimos 30 dias): ${habits.length} hábitos, ${completedLogs} check-ins completos de ${totalLogs} totais, taxa de sucesso ${successRate}%, streak atual ${currentStreak} dias.` +
    (bestDayEntry ? ` Melhor dia para conclusão: ${bestDayEntry.day} (${Math.round(bestDayEntry.rate)}%).` : '');

  const recentLines = Object.entries(byHabit).slice(0, 15).map(([name, v]) => {
    const moodStr = v.moods.length ? `; humores: ${v.moods.slice(0, 5).join(', ')}` : '';
    return `${name}: ${v.completed}/${v.total} concluídos${moodStr}`;
  });
  const recentSummary =
    recentLines.length === 0
      ? 'Nenhum registro recente.'
      : `Resumo por hábito (últimos 30 dias): ${recentLines.join('. ')}`;

  return { habitsSummary, statsSummary, recentSummary };
}

/**
 * Valida o corpo da pergunta e retorna o texto ou lança.
 */
export function validateQuestion(body: unknown): string {
  if (body === null || typeof body !== 'object' || !('question' in body)) {
    throw new AppError(400, 'Corpo deve conter "question" (string).');
  }
  const q = (body as { question?: unknown }).question;
  if (typeof q !== 'string' || !q.trim()) {
    throw new AppError(400, 'Pergunta não pode estar vazia.');
  }
  const trimmed = q.trim();
  if (trimmed.length > MAX_QUESTION_LENGTH) {
    throw new AppError(400, `Pergunta deve ter no máximo ${MAX_QUESTION_LENGTH} caracteres.`);
  }
  return trimmed;
}

/**
 * Chama a OpenAI com contexto e pergunta; retorna a resposta em texto ou lança.
 */
export async function askLLM(context: AskContext, question: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    throw new AppError(503, 'Serviço de IA indisponível. OPENAI_API_KEY não configurada.');
  }

  const openai = new OpenAI({ apiKey });
  const systemContent = `Você é um assistente de hábitos e produtividade. Responda em português do Brasil, de forma breve e motivadora (2 a 4 frases). Baseie-se APENAS nos dados do usuário fornecidos abaixo. Se os dados não forem suficientes para responder, diga isso de forma gentil e sugira registrar mais check-ins.

Dados do usuário:
- ${context.habitsSummary}
- ${context.statsSummary}
- ${context.recentSummary}`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: question },
    ],
    max_tokens: 300,
    temperature: 0.6,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new AppError(502, 'Resposta vazia do modelo.');
  }
  return content;
}
