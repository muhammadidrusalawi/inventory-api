import * as z from 'zod';

export const registerSchema = z.object({
  name: z.string({
    error: 'Name is required',
  }),
  email: z.string().email({
    error: 'Email is required',
  }),
  password: z.string().min(8, {
    error: 'Password must be at least 8 characters long',
  }),
});

export const verifyOTPSchema = z.object({
  email: z.string().email({
    error: 'Email is required',
  }),
  otp: z.string({
    error: 'OTP is required',
  }),
});

export const loginSchema = z.object({
  email: z.string().email({
    error: 'Email is required',
  }),
  password: z.string({
    error: 'Password is required',
  }),
});

export const resetPasswordSchema = z.object({
  email: z.string().email({
    error: 'Email is required',
  }),
});

export const newPasswordSchema = z.object({
  new_password: z.string().min(8, {
    error: 'Password must be at least 8 characters long',
  }),
  token: z.string({
    error: 'Token is required',
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
