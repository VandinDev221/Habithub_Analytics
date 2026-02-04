import type { Request, Response, NextFunction } from 'express';
import { pgPool } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export async function exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const format = (req.params.format ?? 'csv').toLowerCase();
    if (format !== 'csv' && format !== 'json') {
      next(new AppError(400, 'Formato inválido. Use csv ou json'));
      return;
    }

    const { rows: habits } = await pgPool.query(
      'SELECT id, name, category, color, goal, created_at FROM habits WHERE user_id = $1 ORDER BY name',
      [userId]
    );
    const { rows: logs } = await pgPool.query(
      `SELECT hl.habit_id, h.name as habit_name, hl.date, hl.completed, hl.mood, hl.notes
       FROM habit_logs hl JOIN habits h ON h.id = hl.habit_id WHERE h.user_id = $1 ORDER BY hl.date DESC`,
      [userId]
    );

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="habithub-export.json"');
      res.json({ habits, logs });
      return;
    }

    const csvLines = ['habit_id,habit_name,date,completed,mood,notes'];
    for (const l of logs) {
      const notes = (l.notes ?? '').replace(/"/g, '""');
      csvLines.push(`${l.habit_id},"${l.habit_name}",${l.date},${l.completed},${l.mood ?? ''},"${notes}"`);
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="habithub-export.csv"');
    res.send('\uFEFF' + csvLines.join('\n'));
  } catch (e) {
    next(e);
  }
}
