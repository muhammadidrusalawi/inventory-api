import express, { Request, Response } from 'express';
import {
  loginController,
  logoutController,
  profileController,
  registerController,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/auth/register', registerController);
router.post('/auth/login', loginController);
router.post('/auth/logout', authMiddleware, logoutController);
router.get('/profile', authMiddleware, profileController);

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'OK!',
  });
});

export default router;
