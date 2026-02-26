import { UserDTO, UserWithStoreDTO } from '../DTOs/user';
import { compare, hash } from 'bcrypt-ts';
import { UserRepository } from '../repositories/user.repository';
import {
  LoginInput,
  NewPasswordInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyOTPInput,
} from '../validators/auth.validation';
import { ApiError } from '../helpers/response-helper';
import { sendMail } from '../../infrastructure/mail/mailer';
import { logger } from '../../infrastructure/logging/logger';
import { generateToken, invalidateToken } from '../../infrastructure/auth/jwt';
import { oauth2Client, scopes } from '../../infrastructure/auth/google-oauth';
import { google } from 'googleapis';
import { redis } from '../../infrastructure/cache/redis';
import crypto from 'crypto';

export const AuthService = {
  // Register User
  register: async (input: RegisterInput): Promise<void> => {
    const email = input.email.toLowerCase().trim();
    const cacheKey = `register:${email}`;

    const exists = await UserRepository.findByEmail(email);
    if (exists) throw new ApiError(409, 'Email sudah terdaftar');

    const cached = await redis.get(cacheKey);
    if (cached) {
      throw new ApiError(429, 'OTP sudah dikirim. Cek email.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await hash(input.password, 10);
    const hashedOtp = await hash(otp, 10);

    const result = await redis.set(
      cacheKey,
      JSON.stringify({
        name: input.name,
        email,
        password: hashedPassword,
        otp: hashedOtp,
        attempts: 0,
      }),
      {
        EX: 300,
        NX: true,
      },
    );

    if (result === null) {
      throw new ApiError(429, 'OTP sudah dikirim. Cek email.');
    }

    sendMail({
      from: `"Invento App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Kode OTP Registrasi',
      text: `Kode OTP kamu: ${otp}\nBerlaku 5 menit.`,
    }).catch((err) => {
      logger.error('Failed to send register email', {
        email,
        error: err,
      });
    });

    return;
  },

  // Verify OTP for Registration User
  verifyOTP: async (input: VerifyOTPInput): Promise<UserDTO> => {
    const email = input.email.toLowerCase().trim();
    const cacheKey = `register:${email}`;

    const cached = await redis.get(cacheKey);
    if (!cached) {
      throw new ApiError(400, 'OTP kadaluarsa atau tidak valid');
    }

    const data: {
      name: string;
      email: string;
      password: string;
      otp: string;
      attempts: number;
    } = JSON.parse(cached);

    if (data.attempts >= 5) {
      await redis.del(cacheKey);
      throw new ApiError(400, 'OTP terlalu banyak salah');
    }

    const isValid = await compare(input.otp, data.otp);
    if (!isValid) {
      const ttl = await redis.ttl(cacheKey);

      await redis.set(
        cacheKey,
        JSON.stringify({
          ...data,
          attempts: data.attempts + 1,
        }),
        { EX: ttl },
      );

      throw new ApiError(400, 'OTP salah');
    }

    const user = await UserRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
      verified_at: new Date(),
    });

    await redis.del(cacheKey);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  },

  // Login User
  login: async (input: LoginInput): Promise<{ user: UserDTO; token: string }> => {
    const user = await UserRepository.findByEmail(input.email);

    if (!user) throw new ApiError(401, 'Email atau password salah');

    if (!user.verified_at) throw new ApiError(401, 'Akun tidak terdaftar');

    const isMatch = await compare(input.password, user.password);

    if (!isMatch) throw new ApiError(401, 'Email atau password salah');

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token: token,
    };
  },

  // Generate Google Auth URL
  generateGoogleAuthURL: () => {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
    });
  },

  // Handle Google Callback
  handleGoogleCallback: async (code: string): Promise<{ user: UserDTO; token: string }> => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const { data } = await oauth2.userinfo.get();

    if (!data?.email || !data?.name) {
      throw new ApiError(400, 'Invalid Google user data');
    }

    const randomPassword = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await hash(randomPassword, 10);

    const user = await UserRepository.upsert({
      where: { email: data.email },
      update: {},
      create: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        verified_at: new Date(),
      },
    });

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token: token,
    };
  },

  // Get User Profile
  profile: async (id: string): Promise<UserWithStoreDTO> => {
    const user = await UserRepository.findByIdWithStore(id);

    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    const stores = user.storeUsers.map((su) => ({
      id: su.store.id,
      name: su.store.name,
      plan: su.store.plan,
      role: {
        id: su.role.id,
        key: su.role.key,
        label: su.role.label,
      },
    }));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      stores,
    };
  },

  // Reset Password User
  resetPassword: async (input: ResetPasswordInput): Promise<void> => {
    const email = input.email.toLowerCase().trim();
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new ApiError(401, 'Email tidak ditemukan');
    }

    const rateKey = `reset-password:email:${email}`;
    const alreadyRequested = await redis.get(rateKey);
    if (alreadyRequested) {
      throw new ApiError(429, 'Link reset password sudah dikirim. Cek email.');
    }

    const token = crypto.randomBytes(32).toString('hex');

    await redis.set(`reset-password:token:${token}`, JSON.stringify({ userId: user.id, email }), {
      EX: 900,
    });

    await redis.set(rateKey, '1', { EX: 900 });

    const resetLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;

    sendMail({
      from: `"Invento App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Password',
      text: `Klik link berikut untuk reset password:\n${resetLink}\n\nLink berlaku 15 menit.`,
    }).catch((err) => {
      logger.error('Failed to send reset password email', { email, err });
    });

    return;
  },

  // Confirm Reset Password User
  confirmResetPassword: async (input: NewPasswordInput): Promise<void> => {
    const tokenKey = `reset-password:token:${input.token}`;
    const cached = await redis.get(tokenKey);

    if (!cached) {
      throw new ApiError(400, 'Token tidak valid atau kadaluarsa');
    }

    const data: { userId: string; email: string } = JSON.parse(cached);
    const hashedPassword = await hash(input.new_password, 10);

    await UserRepository.updatePassword(data.userId, hashedPassword);
    await redis.del(tokenKey);
    await redis.del(`reset-password:email:${data.email}`);

    return;
  },

  // Logout User
  logout: async (token: string): Promise<null> => {
    await invalidateToken(token);

    return null;
  },
};
