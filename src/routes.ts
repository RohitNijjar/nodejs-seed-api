import { Router } from 'express';

import { authRoutes } from './features/auth/authRoutes';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/auth', authRoutes);

export { router };
