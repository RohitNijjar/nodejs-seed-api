import { Router } from 'express';

import { authRoutes } from './features/auth/authRoutes';
import { rateLimitByIpMiddleware } from './middlewares/rateLimiter';

const apiRoutes = Router();

apiRoutes.get('/', (_req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

apiRoutes.use('/auth', rateLimitByIpMiddleware, authRoutes);

export { apiRoutes };
