import { Router } from 'express';

import { authMiddleware } from '../../../middlewares/auth';
import { validateRequest } from '../../../middlewares/validateRequest';
import { AuthController } from '../controllers/authController';
import {
  externalLoginValidation,
  forgotPasswordValidation,
  loginValidation,
  registerValidation,
  resetPasswordValidation,
  sendVerificationEmailValidation,
} from '../validators/authValidations';

const authRoutes = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     security: []
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateUserResponse'
 *       400:
 *         description: Bad Request
 *       409:
 *         description: Conflict
 *       500:
 *         description: Internal Server Error
 */
authRoutes.post(
  '/register',
  validateRequest(registerValidation),
  AuthController.register,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: login a user
 *     security: []
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthenticatedUserResponse'
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
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
authRoutes.get(
  '/external-Login',
  validateRequest(externalLoginValidation, 'query'),
  AuthController.externalLogin,
);
authRoutes.get(
  '/external-login-callback',
  AuthController.externalLoginCallback,
);

export { authRoutes };
