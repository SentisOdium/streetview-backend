import { Router } from 'express';
import { login, logout, verifySession, register, getAdmins, deleteAdmin, updateAdminRole, getAdminDetails, updateAdmin, forgotPassword, verifyOtp, resetPassword, superAdminResetOtp, superAdminResetPassword } from '../controllers/adminAuthController.js';
import { authenticateAdmin } from '../middleware/authenticateAdmin.js';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';

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

// Password Reset Routes
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/verify-otp', passwordResetLimiter, verifyOtp);
router.post('/reset-password', passwordResetLimiter, resetPassword);

// Super Admin Secure Reset Routes (Option B)
router.post('/superadmin-reset-otp', authenticateAdmin, passwordResetLimiter, superAdminResetOtp);
router.post('/superadmin-reset-password', authenticateAdmin, passwordResetLimiter, superAdminResetPassword);

export default router;
