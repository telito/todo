import { NextFunction, Request, Response } from 'express';
import { AppError, isAppError } from '../utils/errors';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (isAppError(err)) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: 'Route not found' });
};

export const assertUserId = (userId: string | undefined): string => {
  if (!userId) {
    throw new AppError(401, 'Authentication required');
  }
  return userId;
};
