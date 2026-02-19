import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import compression from 'compression';
import { httpLogger } from './logging/logger';
import rateLimit from 'express-rate-limit';
import router from '../app/routes/index';
import { globalErrorHandler } from '../app/middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  morgan((tokens, req, res) => {
    httpLogger.log({
      level: 'info',
      message: undefined as unknown as string,
      method: tokens.method?.(req, res),
      url: tokens.url?.(req, res),
      status: Number(tokens.status?.(req, res)),
      responseTime: Number(tokens['response-time']?.(req, res)),
      timestamp: new Date().toISOString(),
    });

    return null;
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use('/api', router);
app.use(globalErrorHandler);

export default app;
