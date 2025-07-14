import { Router } from 'express';
import { refreshToken, logout } from '../controllers/session.controller';

const router = Router();

// Route to refresh access token
router.post('/refresh', refreshToken);

// Route to log out
router.post('/logout', logout);

export default router;
