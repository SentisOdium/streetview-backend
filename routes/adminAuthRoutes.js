import { Router } from 'express';
import { login, logout, verifySession, register, getAdmins } from '../controllers/adminAuthController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/register', authenticateAdmin, register);
router.get('/admins', authenticateAdmin, getAdmins);
router.get('/verify', authenticateAdmin, verifySession);
router.get('/profile', authenticateAdmin, verifySession); // Alias for verify

export default router;
