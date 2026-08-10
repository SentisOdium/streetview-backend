import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { logAudit } from './admin/auditService.js';
import { sendOtpEmail } from '../utils/email.js';

function maskEmail(email) {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return `${local}@*******.com`;
  const tld = domainParts[domainParts.length - 1];
  return `${local}@*******.${tld}`;
}

export const getAllAdmins = async () => {
  const [rows] = await pool.query(
    'SELECT admin_id, email, first_name, last_name, role, created_at, last_login, street_address, barangay, district, city, province, postal_code FROM admins WHERE deleted_at IS NULL ORDER BY created_at DESC'
  );
  
  return rows.map(admin => {
    const firstInitial = admin.first_name ? `${admin.first_name.charAt(0).toUpperCase()}.` : '';
    return {
      admin_id: admin.admin_id,
      last_name: admin.last_name,
      first_name_initial: firstInitial,
      email: maskEmail(admin.email),
      role: admin.role,
      created_at: admin.created_at,
      last_login: admin.last_login,
      street_address: admin.street_address,
      barangay: admin.barangay,
      district: admin.district,
      city: admin.city,
      province: admin.province,
      postal_code: admin.postal_code
    };
  });
};

export const loginAdmin = async (email, password, ipAddress) => {
  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Find admin by email (active accounts only)
  const [rows] = await pool.query('SELECT * FROM admins WHERE email = ? AND deleted_at IS NULL', [email]);
  const admin = rows[0];

  if (!admin) {
    // Log failed attempt without revealing if email exists
    await pool.query(
      "INSERT INTO admin_login_logs (login_status, ip_address) VALUES ('failed', ?)",
      [ipAddress]
    );
    throw new Error('Invalid email or password.');
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, admin.password_hash);
  
  if (!isMatch) {
    await pool.query(
      "INSERT INTO admin_login_logs (admin_id, login_status, ip_address) VALUES (?, 'failed', ?)",
      [admin.admin_id, ipAddress]
    );
    throw new Error('Invalid email or password.');
  }

  // Generate JWT
  const tokenPayload = {
    adminId: admin.admin_id,
    email: admin.email,
    role: admin.role,
  };
  const token = generateToken(tokenPayload);

  // Update last login
  await pool.query('UPDATE admins SET last_login = NOW() WHERE admin_id = ?', [admin.admin_id]);

  // Log success
  await pool.query(
    "INSERT INTO admin_login_logs (admin_id, login_status, ip_address) VALUES (?, 'success', ?)",
    [admin.admin_id, ipAddress]
  );

  return { token, admin: { id: admin.admin_id, email: admin.email, name: `${admin.first_name} ${admin.last_name}`, role: admin.role } };
};

export const getAdminProfile = async (adminId) => {
  const [rows] = await pool.query('SELECT admin_id, email, first_name, middle_initial, last_name, last_login, created_at, role FROM admins WHERE admin_id = ?', [adminId]);
  return rows[0];
};

export const registerAdmin = async (email, password, firstName, middleInitial, lastName, streetAddress, barangay, district, city, province, postalCode, role) => {
  if (!email || !password || !firstName || !lastName || !streetAddress || !barangay || !city || !province || !postalCode) {
    throw new Error('Email, password, first name, last name, and complete address details are required');
  }

  const [existing] = await pool.query('SELECT email FROM admins WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new Error('Admin with this email already exists');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const [result] = await pool.query(
    'INSERT INTO admins (email, password_hash, first_name, middle_initial, last_name, street_address, barangay, district, city, province, postal_code, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [email, passwordHash, firstName, middleInitial || null, lastName, streetAddress, barangay, district || null, city, province, postalCode, role || 'admin']
  );

  try {
    await logAudit({
      action: 'CREATE',
      entityType: 'admin',
      entityId: result.insertId,
      locationName: `Admin Registration: ${email}`,
      adminUser: 'System'
    });
  } catch (err) {
    console.error('Failed to log admin registration audit log:', err);
  }

  return result.insertId;
};

export const softDeleteAdmin = async (targetAdminId, performerAdminEmail) => {
  // Check if target admin exists
  const [rows] = await pool.query('SELECT admin_id, email, role FROM admins WHERE admin_id = ? AND deleted_at IS NULL', [targetAdminId]);
  const targetAdmin = rows[0];
  if (!targetAdmin) {
    throw new Error('Admin account not found or already deleted');
  }

  // Double check that they are not deleting a superadmin
  if (targetAdmin.role === 'super_admin') {
    throw new Error('Cannot delete a fellow super administrator');
  }

  // Soft delete
  await pool.query('UPDATE admins SET deleted_at = NOW() WHERE admin_id = ?', [targetAdminId]);

  // Log audit
  try {
    await logAudit({
      action: 'DELETE',
      entityType: 'admin',
      entityId: targetAdminId,
      locationName: `Admin Account Deletion: ${targetAdmin.email}`,
      adminUser: performerAdminEmail
    });
  } catch (err) {
    console.error('Failed to log admin deletion audit log:', err);
  }
  return true;
};

export const changeAdminRole = async (targetAdminId, newRole, performerAdminEmail) => {
  const [rows] = await pool.query('SELECT admin_id, email, role FROM admins WHERE admin_id = ? AND deleted_at IS NULL', [targetAdminId]);
  const targetAdmin = rows[0];
  if (!targetAdmin) {
    throw new Error('Admin account not found or deleted');
  }

  await pool.query('UPDATE admins SET role = ? WHERE admin_id = ?', [newRole, targetAdminId]);

  try {
    await logAudit({
      action: 'UPDATE',
      entityType: 'admin',
      entityId: targetAdminId,
      locationName: `Admin Role Elevation: ${targetAdmin.email} to ${newRole}`,
      adminUser: performerAdminEmail
    });
  } catch (err) {
    console.error('Failed to log admin role change audit log:', err);
  }
  return true;
};

export const getAdminById = async (adminId) => {
  const [rows] = await pool.query(
    'SELECT admin_id, email, first_name, middle_initial, last_name, street_address, barangay, district, city, province, postal_code, role, created_at, last_login FROM admins WHERE admin_id = ? AND deleted_at IS NULL',
    [adminId]
  );
  return rows[0];
};

export const updateAdminDetails = async (adminId, updateData, performerAdminEmail) => {
  const { email, password, firstName, middleInitial, lastName, streetAddress, barangay, district, city, province, postalCode, role } = updateData;

  let query = 'UPDATE admins SET email = ?, first_name = ?, middle_initial = ?, last_name = ?, street_address = ?, barangay = ?, district = ?, city = ?, province = ?, postal_code = ?';
  const params = [email, firstName, middleInitial || null, lastName, streetAddress || null, barangay || null, district || null, city || null, province || null, postalCode || null];

  if (password) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    query += ', password_hash = ?';
    params.push(passwordHash);
  }

  if (role) {
    query += ', role = ?';
    params.push(role);
  }

  query += ' WHERE admin_id = ? AND deleted_at IS NULL';
  params.push(adminId);

  const [result] = await pool.query(query, params);

  if (result.affectedRows === 0) {
    throw new Error('Admin account not found or deleted');
  }

  try {
    await logAudit({
      action: 'UPDATE',
      entityType: 'admin',
      entityId: adminId,
      locationName: `Admin Account Update: ${email}`,
      adminUser: performerAdminEmail
    });
  } catch (err) {
    console.error('Failed to log admin update audit log:', err);
  }

  return true;
};

export const generateResetOtp = async (email) => {
  // Check if active admin exists with this email
  const [admins] = await pool.query('SELECT admin_id FROM admins WHERE email = ? AND deleted_at IS NULL', [email]);
  if (admins.length === 0) {
    throw new Error('Admin account with this email does not exist.');
  }

  // Delete any existing active resets for this email to prevent multi-session conflicts
  await pool.query('DELETE FROM admin_password_resets WHERE email = ?', [email]);

  // Generate secure 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Expiry time is 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Store in database
  await pool.query(
    'INSERT INTO admin_password_resets (email, otp_code, expires_at) VALUES (?, ?, ?)',
    [email, otp, expiresAt]
  );

  // Send the email OTP (nodemailer)
  await sendOtpEmail(email, otp);
  return true;
};

export const verifyResetOtp = async (email, otp) => {
  // Find the latest reset record for this email
  const [resets] = await pool.query(
    'SELECT * FROM admin_password_resets WHERE email = ? ORDER BY created_at DESC LIMIT 1',
    [email]
  );

  const reset = resets[0];
  if (!reset) {
    throw new Error('No password reset request found for this email.');
  }

  // Check if expired
  if (new Date(reset.expires_at) < new Date()) {
    // Clean up
    await pool.query('DELETE FROM admin_password_resets WHERE id = ?', [reset.id]);
    throw new Error('OTP has expired. Please request a new one.');
  }

  // Check if already verified
  if (reset.is_verified) {
    throw new Error('This OTP has already been verified. Proceed to resetting your password.');
  }

  // Verify OTP code
  if (reset.otp_code !== otp) {
    const newAttempts = reset.failed_attempts + 1;
    if (newAttempts >= 5) {
      // Invalidate/delete the OTP session
      await pool.query('DELETE FROM admin_password_resets WHERE id = ?', [reset.id]);
      throw new Error('Too many incorrect attempts. This OTP has been invalidated. Please request a new one.');
    } else {
      await pool.query('UPDATE admin_password_resets SET failed_attempts = ? WHERE id = ?', [newAttempts, reset.id]);
      throw new Error(`Invalid OTP. ${5 - newAttempts} attempts remaining.`);
    }
  }

  // Mark as verified and reset failed attempts
  await pool.query(
    'UPDATE admin_password_resets SET is_verified = 1, failed_attempts = 0 WHERE id = ?',
    [reset.id]
  );

  return true;
};

export const completePasswordReset = async (email, otp, newPassword) => {
  // Find reset record
  const [resets] = await pool.query(
    'SELECT * FROM admin_password_resets WHERE email = ? AND otp_code = ? ORDER BY created_at DESC LIMIT 1',
    [email, otp]
  );

  const reset = resets[0];
  if (!reset) {
    throw new Error('Invalid reset session.');
  }

  // Check if expired (make sure it's within 10 minutes of generation)
  const isExpired = new Date(reset.expires_at) < new Date();
  if (isExpired) {
    await pool.query('DELETE FROM admin_password_resets WHERE id = ?', [reset.id]);
    throw new Error('Session expired. Please start over.');
  }

  // Check if verified
  if (!reset.is_verified) {
    throw new Error('OTP has not been verified yet.');
  }

  // Find admin
  const [admins] = await pool.query('SELECT admin_id FROM admins WHERE email = ? AND deleted_at IS NULL', [email]);
  const admin = admins[0];
  if (!admin) {
    throw new Error('Admin account not found.');
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update password in db
  await pool.query('UPDATE admins SET password_hash = ? WHERE admin_id = ?', [passwordHash, admin.admin_id]);

  // Delete the reset record
  await pool.query('DELETE FROM admin_password_resets WHERE id = ?', [reset.id]);

  // Log audit log
  try {
    await logAudit({
      action: 'UPDATE',
      entityType: 'admin',
      entityId: admin.admin_id,
      locationName: `Password Reset: ${email}`,
      adminUser: 'System/OTP'
    });
  } catch (err) {
    console.error('Failed to log password reset audit log:', err);
  }

  return true;
};

export const completeSuperAdminPasswordReset = async (superAdminEmail, otp, targetAdminId, newPassword) => {
  // 1. Verify OTP against Super Admin's email (if not already verified)
  const [existingResets] = await pool.query(
    'SELECT is_verified FROM admin_password_resets WHERE email = ? AND otp_code = ? ORDER BY created_at DESC LIMIT 1',
    [superAdminEmail, otp]
  );
  if (!existingResets[0] || !existingResets[0].is_verified) {
    await verifyResetOtp(superAdminEmail, otp);
  }

  // 2. Find target admin
  const [admins] = await pool.query('SELECT admin_id, email FROM admins WHERE admin_id = ? AND deleted_at IS NULL', [targetAdminId]);
  const admin = admins[0];
  if (!admin) {
    throw new Error('Target administrator account not found.');
  }

  // Find reset record for super admin
  const [resets] = await pool.query(
    'SELECT * FROM admin_password_resets WHERE email = ? AND otp_code = ? ORDER BY created_at DESC LIMIT 1',
    [superAdminEmail, otp]
  );
  const reset = resets[0];
  if (!reset) {
    throw new Error('Invalid reset session.');
  }

  const isExpired = new Date(reset.expires_at) < new Date();
  if (isExpired) {
    await pool.query('DELETE FROM admin_password_resets WHERE id = ?', [reset.id]);
    throw new Error('Session expired. Please start over.');
  }

  if (!reset.is_verified) {
    throw new Error('OTP has not been verified yet.');
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update target admin password in db
  await pool.query('UPDATE admins SET password_hash = ? WHERE admin_id = ?', [passwordHash, targetAdminId]);

  // Delete the reset record
  await pool.query('DELETE FROM admin_password_resets WHERE id = ?', [reset.id]);

  // Log audit log
  try {
    await logAudit({
      action: 'UPDATE',
      entityType: 'admin',
      entityId: targetAdminId,
      locationName: `Password Reset by Super Admin (${superAdminEmail})`,
      adminUser: superAdminEmail
    });
  } catch (err) {
    console.error('Failed to log super admin password reset audit log:', err);
  }

  return true;
};
