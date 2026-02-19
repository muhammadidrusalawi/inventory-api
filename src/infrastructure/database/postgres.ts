import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from '../logging/logger';
import configDotenv from 'dotenv';

configDotenv.config();

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'],
    // adapter: new PrismaPg({
    //   connectionString: String(process.env.DATABASE_URL),
    // }),

    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
  });
}

export async function connectDB(): Promise<void> {
  try {
    await globalForPrisma.prisma!.$connect();
    logger.info('Postgresql database connected successfully');
  } catch (error) {
    logger.error('Postgresql database connection failed', { error });
    process.exit(1);
  }
}

export const prisma = globalForPrisma.prisma!;
