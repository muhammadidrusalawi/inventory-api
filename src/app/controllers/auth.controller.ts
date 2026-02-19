import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema, registerSchema } from '../validators/auth.validation';
import { successResponse } from '../helpers/response-helper';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedInput = registerSchema.parse(req.body);
    const user = await AuthService.register(validatedInput);
    successResponse(res, 'Berhasil mendaftar', user, 201);
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

export const profileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.profile((req as any).user.id);

    successResponse(res, 'OK', user);
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
