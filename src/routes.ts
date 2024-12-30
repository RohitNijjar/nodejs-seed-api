import { Router } from 'express';

import { authRoutes } from './features/auth/authRoutes';

const apiRoutes = Router();

apiRoutes.get('/', (_req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

apiRoutes.use('/auth', authRoutes);

export { apiRoutes };
