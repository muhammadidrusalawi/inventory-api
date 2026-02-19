import * as z from 'zod';

export const registerSchema = z.object({
  name: z.string({
    error: 'Name is required',
  }),
  email: z.string().email({
    error: 'Email is required',
  }),
  password: z.string().min(6, {
    error: 'Password must be at least 6 characters long',
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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
