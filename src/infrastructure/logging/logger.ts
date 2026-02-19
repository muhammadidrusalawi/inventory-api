import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL as string,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

export const httpLogger = winston.createLogger({
  level: 'info',
  format: winston.format.printf((info) => {
    return JSON.stringify({
      level: info.level,
      method: info.method,
      url: info.url,
      status: info.status,
      responseTime: info.responseTime,
      timestamp: info.timestamp,
    });
  }),
  transports: [new winston.transports.Console()],
});
