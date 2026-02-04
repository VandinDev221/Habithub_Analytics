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

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal Server Error';
  const isDev = process.env.NODE_ENV !== 'production';
  if (status === 500) console.error(err);
  // Em desenvolvimento, incluir mensagem real do erro para facilitar debug
  const safeMessage = status === 500 && isDev && err.message ? err.message : message;
  res.status(status).json({ error: safeMessage });
}
