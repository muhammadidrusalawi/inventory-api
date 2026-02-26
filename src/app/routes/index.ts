import express, { Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  confirmResetPasswordController,
  googleAuthCallbackController,
  googleAuthRedirectController,
  googleCodeExchangeController,
  loginController,
  logoutController,
  profileController,
  registerController,
  resetPasswordController,
  verifyOTPController,
} from '../controllers/auth.controller';
import { getAllRoleController, getRoleByIdController } from '../controllers/role.controller';
import {
  getAllPermissionController,
  getPermissionByIdController,
} from '../controllers/permission.controller';
import { createStoreController, getAllStoreController } from '../controllers/store.controller';
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoryController,
} from '../controllers/category.controller';
import {
  createUserStoreController,
  getAllUserStoreController,
} from '../controllers/user.controller';

const router = express.Router();

router.post('/auth/register', registerController);
router.post('/auth/verify-otp', verifyOTPController);
router.post('/auth/login', loginController);
router.get('/auth/google', googleAuthRedirectController);
router.get('/auth/google/callback', googleAuthCallbackController);
router.post('/auth/google/exchange', googleCodeExchangeController);
router.get('/auth/profile', authMiddleware, profileController);
router.post('/auth/reset-password', resetPasswordController);
router.post('/auth/reset-password/confirm', confirmResetPasswordController);
router.post('/auth/logout', authMiddleware, logoutController);

router.get('/roles', authMiddleware, getAllRoleController);
router.get('/roles/:id', authMiddleware, getRoleByIdController);

router.get('/permissions', authMiddleware, getAllPermissionController);
router.get('/permissions/:id', authMiddleware, getPermissionByIdController);

router.post('/stores', authMiddleware, createStoreController);
router.get('/stores', authMiddleware, getAllStoreController);

router.get('/stores/:store_id/users', authMiddleware, getAllUserStoreController);
router.post('/stores/:store_id/users', authMiddleware, createUserStoreController);

// router.post('/stores/:store_id/categories', authMiddleware, createCategoryController);
// router.get('/stores/:store_id/categories', authMiddleware, getAllCategoryController);
// router.delete('/stores/:store_id/categories/:id', authMiddleware, deleteCategoryController);

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'OK!',
  });
});

export default router;
