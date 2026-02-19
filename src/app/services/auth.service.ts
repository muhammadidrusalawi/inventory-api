import { UserDTO } from '../DTOs/user';
import { compare, hash } from 'bcrypt-ts';
import { UserRepository } from '../repositories/user.repository';
import { LoginInput, RegisterInput } from '../validators/auth.validation';
import { ApiError } from '../helpers/response-helper';
import { sendMail } from '../../infrastructure/mail/mailer';
import { logger } from '../../infrastructure/logging/logger';
import { generateToken, invalidateToken } from '../../infrastructure/auth/jwt';

export const AuthService = {
  register: async (input: RegisterInput): Promise<UserDTO> => {
    const exists = await UserRepository.findByEmail(input.email);

    if (exists) throw new ApiError(409, 'Email sudah terdaftar');

    const hashed = await hash(input.password, 10);

    const createdUser = await UserRepository.create({
      name: input.name,
      email: input.email,
      password: hashed,
    });

    sendMail({
      from: `"Invento App" <${process.env.SMTP_USER}>`,
      to: createdUser.email,
      subject: 'Registrasi Berhasil',
      text: `Halo ${createdUser.name}, akun kamu berhasil dibuat.`,
    }).catch((err) => {
      logger.error('Failed to send register email', err);
      throw err;
    });

    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
    };
  },

  login: async (input: LoginInput): Promise<{ user: UserDTO; token: string }> => {
    const user = await UserRepository.findByEmail(input.email);

    if (!user) throw new ApiError(401, 'Email atau password salah');

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

  profile: async (id: string): Promise<UserDTO> => {
    const user = await UserRepository.findById(id);

    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  },

  logout: async (token: string): Promise<null> => {
    await invalidateToken(token);

    return null;
  },
};
