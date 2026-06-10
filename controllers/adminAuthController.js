import * as authService from '../services/authService.js';

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
    const { email, password, firstName, middleInitial, lastName } = req.body;
    
    await authService.registerAdmin(email, password, firstName, middleInitial, lastName);

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
