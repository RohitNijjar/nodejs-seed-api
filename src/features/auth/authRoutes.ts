import { Router } from 'express';

import { AuthController } from './controllers/authController';
import {
  forgotPasswordValidation,
  loginValidation,
  registerValidation,
  resetPasswordValidation,
  sendVerificationEmailValidation,
} from './validators/authValidations';
import { authMiddleware } from '../../middlewares/auth';
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
authRoutes.post('/verify-email', AuthController.verifyEmail);
authRoutes.post(
  '/forgot-password',
  validateRequest(forgotPasswordValidation),
  AuthController.forgotPassword,
);
authRoutes.post(
  '/reset-password',
  validateRequest(resetPasswordValidation),
  AuthController.resetPassword,
);
authRoutes.post(
  '/send-verification-email',
  validateRequest(sendVerificationEmailValidation),
  AuthController.sendVerificationEmail,
);
authRoutes.post('/logout', authMiddleware, AuthController.logout);
authRoutes.post('/renew-token', AuthController.renewToken);
authRoutes.get('/external-Login', AuthController.externalLogin);
authRoutes.get(
  '/external-login-callback',
  AuthController.externalLoginCallback,
);

export { authRoutes };
