import type { Request, Response, NextFunction } from 'express';
import { pgPool } from '../config/db.js';

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { from, to } = req.query;
    const fromDate = (from as string) ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const toDate = (to as string) ?? new Date().toISOString().slice(0, 10);

    const [{ rows: habits }, { rows: logs }] = await Promise.all([
      pgPool.query('SELECT id, name, category, color FROM habits WHERE user_id = $1', [userId]),
      pgPool.query(
        `SELECT hl.habit_id, hl.date, hl.completed, hl.mood
         FROM habit_logs hl
         JOIN habits h ON h.id = hl.habit_id
         WHERE h.user_id = $1 AND hl.date >= $2 AND hl.date <= $3
         ORDER BY hl.date`,
        [userId, fromDate, toDate]
      ),
    ]);

    const byHabit: Record<string, { date: string; completed: boolean; mood?: string }[]> = {};
    for (const log of logs) {
      if (!byHabit[log.habit_id]) byHabit[log.habit_id] = [];
      byHabit[log.habit_id].push({
        date: log.date,
        completed: log.completed,
        mood: log.mood ?? undefined,
      });
    }

    const categoryCount: Record<string, number> = {};
    for (const h of habits as { category?: string | null }[]) {
      const cat = h.category ?? 'Outros';
      categoryCount[cat] = (categoryCount[cat] ?? 0) + 1;
    }

    const totalCompleted = logs.filter((l: { completed: boolean }) => l.completed).length;
    const totalDays = new Set(logs.map((l: { date: string }) => l.date)).size;
    const successRate = totalDays > 0 ? Math.round((totalCompleted / (totalDays * habits.length || 1)) * 100) : 0;

    let currentStreak = 0;
    const today = new Date().toISOString().slice(0, 10);
    const datesSet = new Set(logs.filter((l: { completed: boolean }) => l.completed).map((l: { date: string }) => l.date));
    for (let d = new Date(today); ; d.setDate(d.getDate() - 1)) {
      const ds = d.toISOString().slice(0, 10);
      if (datesSet.has(ds)) currentStreak++;
      else break;
    }

    res.json({
      habits,
      logsByHabit: byHabit,
      categories: Object.entries(categoryCount).map(([name, count]) => ({ name, count })),
      stats: {
        totalHabits: habits.length,
        totalCompleted,
        successRate,
        currentStreak,
        from: fromDate,
        to: toDate,
      },
    });
  } catch (e) {
    next(e);
  }
}
