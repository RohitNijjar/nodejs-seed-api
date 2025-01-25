import { Router } from 'express';

import { authRoutes } from './features/auth/authRoutes';
import { userRoutes } from './features/user/userRoutes';
import { authMiddleware } from './middlewares/auth';
import {
  rateLimitByIpMiddleware,
  rateLimitByUserMiddleware,
} from './middlewares/rateLimiter';

const apiRoutes = Router();

apiRoutes.get('/', (_req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

apiRoutes.use('/auth', rateLimitByIpMiddleware, authRoutes);
apiRoutes.use('/user', authMiddleware, rateLimitByUserMiddleware, userRoutes);

export { apiRoutes };
