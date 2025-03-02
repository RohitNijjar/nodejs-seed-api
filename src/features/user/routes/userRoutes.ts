import { Router } from 'express';

import { UserController } from '../controllers/userController';

const userRoutes = Router();

userRoutes.get('/test', UserController.test);

export { userRoutes };
