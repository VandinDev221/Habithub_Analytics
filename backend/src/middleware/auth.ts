import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export interface JwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

import { JWT_SECRET } from '../config/auth.js';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const raw = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = raw?.trim() ?? null;
  if (!token) {
    next(new AppError(401, 'Token não fornecido'));
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(new AppError(401, 'Token inválido ou expirado'));
  }
}
