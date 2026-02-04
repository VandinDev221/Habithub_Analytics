import type { Request, Response, NextFunction } from 'express';
import { pgPool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listHabits(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { rows } = await pgPool.query(
      `SELECT id, user_id, name, category, color, goal, reminder_time, created_at
       FROM habits WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

export async function createHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { name, category, color, goal, reminder_time } = req.body;
    if (!name?.trim()) {
      next(new AppError(400, 'Nome do hábito é obrigatório'));
      return;
    }
    const { rows } = await pgPool.query(
      `INSERT INTO habits (user_id, name, category, color, goal, reminder_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, name, category, color, goal, reminder_time, created_at`,
      [userId, name.trim(), category ?? null, color ?? '#3B82F6', goal ?? 'daily', reminder_time ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    next(e);
  }
}

export async function updateHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, category, color, goal, reminder_time } = req.body;
    const { rows } = await pgPool.query(
      `UPDATE habits SET name = COALESCE($2, name), category = COALESCE($3, category),
       color = COALESCE($4, color), goal = COALESCE($5, goal), reminder_time = $6, updated_at = NOW()
       WHERE id = $1 AND user_id = $7
       RETURNING id, user_id, name, category, color, goal, reminder_time, created_at, updated_at`,
      [id, name ?? null, category ?? null, color ?? null, goal ?? null, reminder_time ?? null, userId]
    );
    if (rows.length === 0) {
      next(new AppError(404, 'Hábito não encontrado'));
      return;
    }
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
}

export async function deleteHabit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { rowCount } = await pgPool.query('DELETE FROM habits WHERE id = $1 AND user_id = $2', [id, userId]);
    if (rowCount === 0) {
      next(new AppError(404, 'Hábito não encontrado'));
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function addLog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { date, completed, mood, notes } = req.body;
    const logDate = date ? new Date(date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const { rows: habit } = await pgPool.query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [id, userId]);
    if (habit.length === 0) {
      next(new AppError(404, 'Hábito não encontrado'));
      return;
    }
    const { rows } = await pgPool.query(
      `INSERT INTO habit_logs (habit_id, date, completed, mood, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (habit_id, date) DO UPDATE SET completed = EXCLUDED.completed, mood = EXCLUDED.mood, notes = EXCLUDED.notes
       RETURNING id, habit_id, date, completed, mood, notes, created_at`,
      [id, logDate, completed !== false, mood ?? null, notes ?? null]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    next(e);
  }
}

export async function getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { from, to } = req.query;
    const { rows: habit } = await pgPool.query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [id, userId]);
    if (habit.length === 0) {
      next(new AppError(404, 'Hábito não encontrado'));
      return;
    }
    const params: (string | undefined)[] = [id];
    const conditions: string[] = ['habit_id = $1'];
    if (from) {
      params.push(String(from));
      conditions.push(`date >= $${params.length}`);
    }
    if (to) {
      params.push(String(to));
      conditions.push(`date <= $${params.length}`);
    }
    const query = `SELECT id, habit_id, date, completed, mood, notes, created_at FROM habit_logs WHERE ${conditions.join(' AND ')} ORDER BY date DESC`;
    const { rows } = await pgPool.query(query, params);
    res.json(rows);
  } catch (e) {
    next(e);
  }
}
