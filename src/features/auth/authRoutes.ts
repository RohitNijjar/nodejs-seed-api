import { Router } from 'express';

import { AuthController } from './authController';
import { loginValidation, registerValidation } from './authValidations';
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

export { authRoutes };
