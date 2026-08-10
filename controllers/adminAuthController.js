import * as authService from '../services/authService.js';
import { adminRegisterSchema, adminUpdateSchema, adminResetPasswordSchema, superAdminResetPasswordSchema } from '../schema/adminValidation.js';

const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const { token, admin } = await authService.loginAdmin(email, password, ipAddress);

    // Set HTTP-only cookie
    res.cookie('admin_token', token, cookieConfig);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { admin }
    });
  } catch (error) {
    if (error.message === 'Invalid email or password.') {
      return res.status(401).json({ success: false, message: error.message });
    }
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('admin_token', { ...cookieConfig, maxAge: 0 });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const verifySession = async (req, res) => {
  try {
    const adminProfile = await authService.getAdminProfile(req.admin.adminId);
    if (!adminProfile) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    res.status(200).json({
      success: true,
      data: { admin: adminProfile }
    });
  } catch (error) {
    console.error('Verify session error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const register = async (req, res) => {
  try {
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only super administrators can register new accounts.'
      });
    }

    const validationResult = await adminRegisterSchema.safeParseAsync(req.body);
    
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(err => err.message).join('. ');
      return res.status(400).json({ success: false, message: errorMessages });
    }

    const { email, password, firstName, middleInitial, lastName, streetAddress, barangay, district, city, province, postalCode, role } = validationResult.data;
    
    await authService.registerAdmin(email, password, firstName, middleInitial, lastName, streetAddress, barangay, district, city, province, postalCode, role);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully'
    });
  } catch (error) {
    if (error.message === 'Admin with this email already exists' || error.message === 'Email, password, first name, and last name are required') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const admins = await authService.getAllAdmins();
    res.status(200).json({
      success: true,
      message: 'Admin list retrieved successfully',
      data: admins
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    // Only super_admin can soft delete
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only super administrators can delete admin accounts.'
      });
    }

    const targetAdminId = parseInt(req.params.id, 10);
    const currentAdminId = req.admin.adminId;

    // Prevent self deletion
    if (targetAdminId === currentAdminId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account.'
      });
    }

    await authService.softDeleteAdmin(targetAdminId, req.adminUser || req.admin.email);

    res.status(200).json({
      success: true,
      message: 'Admin account deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Admin account not found or already deleted' || error.message === 'Cannot delete a fellow super administrator') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Delete admin error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const updateAdminRole = async (req, res) => {
  try {
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only super administrators can modify roles.'
      });
    }

    const targetAdminId = parseInt(req.params.id, 10);
    const { role } = req.body;

    if (!['admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    await authService.changeAdminRole(targetAdminId, role, req.adminUser || req.admin.email);

    res.status(200).json({
      success: true,
      message: `Admin role updated to ${role} successfully`
    });
  } catch (error) {
    if (error.message === 'Admin account not found or deleted') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const getAdminDetails = async (req, res) => {
  try {
    const targetAdminId = parseInt(req.params.id, 10);
    const requesterId = req.admin.adminId;
    const requesterRole = req.admin.role;

    // Check authorization: only super_admin or the admin themselves can view full details
    if (requesterRole !== 'super_admin' && requesterId !== targetAdminId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view this profile.'
      });
    }

    const admin = await authService.getAdminById(targetAdminId);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Get admin details error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const targetAdminId = parseInt(req.params.id, 10);
    const requesterId = req.admin.adminId;
    const requesterRole = req.admin.role;

    // Check authorization: only super_admin or the admin themselves can edit
    if (requesterRole !== 'super_admin' && requesterId !== targetAdminId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to edit this profile.'
      });
    }

    // Validate body
    const validationResult = await adminUpdateSchema.safeParseAsync({
      ...req.body,
      adminId: targetAdminId
    });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(err => err.message).join('. ');
      return res.status(400).json({ success: false, message: errorMessages });
    }

    // Admins cannot change their own role (only super_admin can do that, but let's restrict it to requesterRole === 'super_admin')
    const updateData = { ...validationResult.data };
    if (requesterRole !== 'super_admin') {
      delete updateData.role; // Prevent role escalation
    }

    await authService.updateAdminDetails(targetAdminId, updateData, req.adminUser || req.admin.email);

    res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully'
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    await authService.generateResetOtp(email);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP has been sent to your email.'
    });
  } catch (error) {
    if (error.message === 'Admin account with this email does not exist.') {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    await authService.verifyResetOtp(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You may now reset your password.'
    });
  } catch (error) {
    if (
      error.message.includes('No password reset request') || 
      error.message.includes('expired') || 
      error.message.includes('verified') || 
      error.message.includes('attempts') || 
      error.message.includes('Invalid OTP')
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const validationResult = await adminResetPasswordSchema.safeParseAsync(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(err => err.message).join('. ');
      return res.status(400).json({ success: false, message: errorMessages });
    }

    const { email, otp, password } = validationResult.data;

    await authService.completePasswordReset(email, otp, password);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    if (
      error.message.includes('Invalid reset session') || 
      error.message.includes('expired') || 
      error.message.includes('verified') || 
      error.message.includes('not found')
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Complete reset password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const superAdminResetOtp = async (req, res) => {
  try {
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only super administrators can generate authorization OTPs.'
      });
    }

    const superAdminEmail = req.admin.email;
    await authService.generateResetOtp(superAdminEmail);

    res.status(200).json({
      success: true,
      message: 'Authorization OTP has been sent to your super admin email.'
    });
  } catch (error) {
    console.error('Super Admin reset OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const superAdminResetPassword = async (req, res) => {
  try {
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only super administrators can perform OTP resets.'
      });
    }

    const validationResult = await superAdminResetPasswordSchema.safeParseAsync(req.body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(err => err.message).join('. ');
      return res.status(400).json({ success: false, message: errorMessages });
    }

    const { targetAdminId, otp, password } = validationResult.data;
    const superAdminEmail = req.admin.email;

    await authService.completeSuperAdminPasswordReset(superAdminEmail, otp, targetAdminId, password);

    res.status(200).json({
      success: true,
      message: 'Administrator password reset successfully.'
    });
  } catch (error) {
    if (
      error.message.includes('No password reset request') || 
      error.message.includes('expired') || 
      error.message.includes('verified') || 
      error.message.includes('attempts') || 
      error.message.includes('Invalid OTP') ||
      error.message.includes('not found')
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Super Admin complete reset password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
