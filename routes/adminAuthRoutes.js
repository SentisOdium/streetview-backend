import { Router } from 'express';
import { login, logout, verifySession, register, getAdmins, deleteAdmin, updateAdminRole, getAdminDetails, updateAdmin } from '../controllers/adminAuthController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/register', authenticateAdmin, register);
router.get('/admins', authenticateAdmin, getAdmins);
router.get('/admins/:id', authenticateAdmin, getAdminDetails);
router.put('/admins/:id', authenticateAdmin, updateAdmin);
router.delete('/admins/:id', authenticateAdmin, deleteAdmin);
router.put('/admins/:id/role', authenticateAdmin, updateAdminRole);
router.get('/verify', authenticateAdmin, verifySession);
router.get('/profile', authenticateAdmin, verifySession); // Alias for verify

export default router;
