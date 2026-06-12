import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { logAudit } from './admin/auditService.js';

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
    'SELECT admin_id, email, first_name, last_name, created_at, last_login FROM admins ORDER BY created_at DESC'
  );
  
  return rows.map(admin => {
    const firstInitial = admin.first_name ? `${admin.first_name.charAt(0).toUpperCase()}.` : '';
    return {
      admin_id: admin.admin_id,
      last_name: admin.last_name,
      first_name_initial: firstInitial,
      email: maskEmail(admin.email),
      created_at: admin.created_at,
      last_login: admin.last_login
    };
  });
};

export const loginAdmin = async (email, password, ipAddress) => {
  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Find admin by email
  const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
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
  };
  const token = generateToken(tokenPayload);

  // Update last login
  await pool.query('UPDATE admins SET last_login = NOW() WHERE admin_id = ?', [admin.admin_id]);

  // Log success
  await pool.query(
    "INSERT INTO admin_login_logs (admin_id, login_status, ip_address) VALUES (?, 'success', ?)",
    [admin.admin_id, ipAddress]
  );

  return { token, admin: { id: admin.admin_id, email: admin.email, name: `${admin.first_name} ${admin.last_name}` } };
};

export const getAdminProfile = async (adminId) => {
  const [rows] = await pool.query('SELECT admin_id, email, first_name, middle_initial, last_name, last_login, created_at FROM admins WHERE admin_id = ?', [adminId]);
  return rows[0];
};

export const registerAdmin = async (email, password, firstName, middleInitial, lastName) => {
  if (!email || !password || !firstName || !lastName) {
    throw new Error('Email, password, first name, and last name are required');
  }

  const [existing] = await pool.query('SELECT email FROM admins WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new Error('Admin with this email already exists');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const [result] = await pool.query(
    'INSERT INTO admins (email, password_hash, first_name, middle_initial, last_name) VALUES (?, ?, ?, ?, ?)',
    [email, passwordHash, firstName, middleInitial || null, lastName]
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
