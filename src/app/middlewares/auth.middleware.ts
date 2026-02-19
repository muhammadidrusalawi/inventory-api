import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../helpers/response-helper';
import { redis } from '../../infrastructure/cache/redis';

interface JWTPayload {
  sub: string;
  jti: string;
  exp: number;
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Unauthorized');
  }

  const token = authHeader.replace('Bearer ', '');

  let decoded: JWTPayload;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
  } catch {
    throw new ApiError(401, 'Invalid token');
  }

  const isBlacklisted = await redis.get(`bl:${decoded.jti}`);
  if (isBlacklisted) {
    throw new ApiError(401, 'Token revoked');
  }

  (req as any).user = {
    id: decoded.sub,
  };

  next();
}
