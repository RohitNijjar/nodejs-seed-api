import { Router } from 'express';

import { AuthController } from './authController';
import {
  changePasswordValidation,
  loginValidation,
  registerValidation,
} from './authValidations';
import { validateRequest } from '../../middlewares/validateRequest';

const authRoutes = Router();

authRoutes.post(
  '/register',
  validateRequest(registerValidation),
  AuthController.register,
);
authRoutes.post(
  '/login',
  validateRequest(loginValidation),
  AuthController.login,
);
authRoutes.get('/verify-email/:token', AuthController.verifyEmail);
authRoutes.post(
  '/change-password',
  validateRequest(changePasswordValidation),
  AuthController.changePassword,
);

export { authRoutes };
