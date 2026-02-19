import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../helpers/response-helper';

/**
 * Global error handler
 */
export function globalErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues.map((issue) => issue.message).join(', '),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // console.error(err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: (err as Error).message,
  });
}
