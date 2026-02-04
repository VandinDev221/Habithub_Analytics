import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

const allowedOriginsEnv = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const allowedOriginsList = allowedOriginsEnv.split(',').map((o) => o.trim()).filter(Boolean);
if (!allowedOriginsList.includes('https://habithub-analytics.vercel.app')) {
  allowedOriginsList.push('https://habithub-analytics.vercel.app');
}

function setCorsHeaders(req: Request, res: Response): void {
  if (res.headersSent) return;
  const origin = req.headers.origin;
  if (origin && allowedOriginsList.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowedOriginsList[0]) {
    res.setHeader('Access-Control-Allow-Origin', allowedOriginsList[0]);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  setCorsHeaders(req, res);
  const status = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal Server Error';
  const isDev = process.env.NODE_ENV !== 'production';
  if (status === 500) console.error(err);
  const safeMessage = status === 500 && isDev && err.message ? err.message : message;
  res.status(status).json({ error: safeMessage });
}
