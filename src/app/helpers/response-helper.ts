import { Response } from 'express';

export class ApiError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const successResponse = <T = any>(
  res: Response,
  message: string,
  data: T | null = null,
  code: number = 200,
) => {
  return res.status(code).json({
    success: true,
    message,
    data,
  });
};
