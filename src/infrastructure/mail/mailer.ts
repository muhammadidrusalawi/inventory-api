import nodemailer from 'nodemailer';
import { logger } from '../logging/logger';

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

export async function checkMailerConnection(): Promise<void> {
  try {
    await mailer.verify();
    logger.info('Gmail SMTP connection verified');
  } catch (error) {
    logger.error('Gmail SMTP connection failed', error);
    throw error;
  }
}

export async function sendMail(options: nodemailer.SendMailOptions): Promise<void> {
  try {
    await mailer.sendMail(options);
  } catch (error) {
    logger.error('Failed to send email', error);
    throw error;
  }
}
