import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as ctrl from '../controllers/authController.js';

const router = Router();

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/oauth-user', ctrl.oauthUser);

router.get('/me', authMiddleware, ctrl.getMe);

export default router;
