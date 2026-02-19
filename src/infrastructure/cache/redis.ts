import { createClient } from 'redis';
import { logger } from '../logging/logger';

const redis = createClient({
  url: process.env.REDIS_URL as string,
});

redis.on('connect', () => {
  logger.info('Redis database connected successfully');
});

redis.on('error', (err) => {
  logger.error(err);
  logger.error('Redis database connection failed');
  process.exit(1);
});

const connectRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }
};

export { redis, connectRedis };
