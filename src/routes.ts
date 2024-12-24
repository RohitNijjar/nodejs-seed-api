import { Router } from "express";

import auth from './features/auth/routes';

const router = Router();

router.get('/', (req, res) => {
    res.json({
        message: 'API - 👋🌎🌍🌏',
    });
});

router.use('/auth', auth);

export default router;