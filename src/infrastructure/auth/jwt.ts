import jwt, { SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { redis } from '../cache/redis';
import configDotenv from 'dotenv';

configDotenv.config();

interface JWTPayload {
  sub: string;
  jti: string;
  exp: number;
}

export function generateToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
      jti: randomUUID(),
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    } as SignOptions,
  );
}

export async function invalidateToken(token: string): Promise<void> {
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;

  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl <= 0) return;

  await redis.set(`bl:${decoded.jti}`, '1', {
    EX: ttl,
  });
}
