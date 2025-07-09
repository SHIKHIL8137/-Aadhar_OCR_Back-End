
import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../util/AppError';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Something went wrong';
console.log(statusCode)
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  res.status(statusCode).json({
    success: false,
    message
  });
};
