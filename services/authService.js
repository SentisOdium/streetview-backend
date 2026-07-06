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
  const params = [email, firstName, middleInitial || null, lastName, streetAddress, barangay, district || null, city, province, postalCode];

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

