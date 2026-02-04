import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pgPool } from '../config/db.js';
import { JWT_SECRET, JWT_EXPIRES } from '../config/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import type { JwtPayload } from '../middleware/auth.js';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name } = req.body;
    if (!email?.trim() || !password) {
      next(new AppError(400, 'Email e senha são obrigatórios'));
      return;
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pgPool.query(
      `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, name, avatar, settings, created_at`,
      [email.trim().toLowerCase(), name?.trim() ?? null, hash]
    );
    if (rows.length === 0) {
      next(new AppError(409, 'Email já cadastrado'));
      return;
    }
    const user = rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email } as JwtPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar }, token });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      next(new AppError(400, 'Email e senha são obrigatórios'));
      return;
    }
    const { rows } = await pgPool.query(
      'SELECT id, email, name, avatar, password_hash FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    if (rows.length === 0) {
      next(new AppError(401, 'Credenciais inválidas'));
      return;
    }
    const user = rows[0];
    if (!user.password_hash) {
      next(new AppError(401, 'Use login social para esta conta'));
      return;
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      next(new AppError(401, 'Credenciais inválidas'));
      return;
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email } as JwtPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.json({
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
      token,
    });
  } catch (e) {
    next(e);
  }
}

export async function oauthUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, name, avatar, provider } = req.body;
    if (!email?.trim()) {
      next(new AppError(400, 'Email é obrigatório'));
      return;
    }
    const { rows: existing } = await pgPool.query(
      'SELECT id, email, name, avatar FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    let user: { id: string; email: string; name: string | null; avatar: string | null };
    if (existing.length > 0) {
      user = existing[0];
      await pgPool.query(
        'UPDATE users SET name = COALESCE($2, name), avatar = COALESCE($3, avatar), updated_at = NOW() WHERE id = $1',
        [user.id, name ?? null, avatar ?? null]
      );
    } else {
      const { rows: inserted } = await pgPool.query(
        `INSERT INTO users (email, name, avatar) VALUES ($1, $2, $3)
         RETURNING id, email, name, avatar`,
        [email.trim().toLowerCase(), name ?? null, avatar ?? null]
      );
      user = inserted[0];
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email } as JwtPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar }, token });
  } catch (e) {
    next(e);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { rows } = await pgPool.query(
      'SELECT id, email, name, avatar, settings, is_admin, created_at FROM users WHERE id = $1',
      [userId]
    );
    if (rows.length === 0) {
      next(new AppError(404, 'Usuário não encontrado'));
      return;
    }
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
}
