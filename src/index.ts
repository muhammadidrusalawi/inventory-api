import configDotenv from 'dotenv';
import app from './infrastructure/server';
import { connectDB } from './infrastructure/database/postgres';
import { logger } from './infrastructure/logging/logger';
import { connectRedis } from './infrastructure/cache/redis';
import { checkMailerConnection } from './infrastructure/mail/mailer';

configDotenv.config();

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    await checkMailerConnection();

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', { error });
    process.exit(1);
  }
};

startServer().catch((err) => {
  logger.error('Unexpected error starting server:', { err });
  process.exit(1);
});
