import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import {
  loginSchema,
  newPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOTPSchema,
} from '../validators/auth.validation';
import { successResponse } from '../helpers/response-helper';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = registerSchema.parse(req.body);
    const user = await AuthService.register(validatedInput);
    successResponse(res, 'Kode OTP terkirim. Silahkan cek email.', user, 200);
  } catch (err) {
    next(err);
  }
};

export const verifyOTPController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = verifyOTPSchema.parse(req.body);
    const user = await AuthService.verifyOTP(validatedInput);
    successResponse(res, 'Berhasil mendaftar', user);
  } catch (err) {
    next(err);
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = loginSchema.parse(req.body);
    const user = await AuthService.login(validatedInput);
    successResponse(res, 'Berhasil login', user);
  } catch (err) {
    next(err);
  }
};

export const googleAuthRedirectController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const url = AuthService.generateGoogleAuthURL();
    res.redirect(url);
  } catch (err) {
    next(err);
  }
};

export const googleAuthCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code } = req.query;
    const redirectUrl = `${process.env.CLIENT_URL}/auth/google-callback?code=${code}`;
    res.redirect(redirectUrl);
  } catch (err) {
    next(err);
  }
};

export const googleCodeExchangeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code } = req.body;
    const user = await AuthService.handleGoogleCallback(code);
    successResponse(res, 'Berhasil login', user);
  } catch (err) {
    next(err);
  }
};

export const profileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.profile((req as any).user.id);

    successResponse(res, 'OK', user);
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = resetPasswordSchema.parse(req.body);
    await AuthService.resetPassword(validatedInput);
    successResponse(res, 'Link reset password terkirim. Silahkan cek email.', null);
  } catch (err) {
    next(err);
  }
};

export const confirmResetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedInput = newPasswordSchema.parse(req.body);
    await AuthService.confirmResetPassword(validatedInput);
    successResponse(res, 'Password baru berhasil dibuat', null);
  } catch (err) {
    next(err);
  }
};

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization!.replace('Bearer ', '');
    await AuthService.logout(token);
    successResponse(res, 'Berhasil logout', null);
  } catch (err) {
    next(err);
  }
};
