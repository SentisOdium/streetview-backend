import pool from "../../config/db.js";

export async function logAudit({
  action,
  entityType,
  entityId = null,
  locationName = null,
  adminUser = "admin",
  oldValue = null,
  newValue = null,
}) {
  try {
    await pool.query(
      `INSERT INTO audit_log (action, entity_type, entity_id, location_name, admin_user, old_value, new_value)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        action,
        entityType,
        entityId,
        locationName,
        adminUser,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
      ]
    );
  } catch (err) {
    console.error("Failed to insert MySQL audit log:", err.message);
  }
}

const parseJson = (val) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

export async function getAuditLogs({ limit = 50, offset = 0 } = {}) {
  try {
    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM audit_log");
    const [rows] = await pool.query(
      `SELECT id, action, entity_type, entity_id, location_name, admin_user,
              old_value, new_value, created_at
       FROM audit_log
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return {
      logs: rows.map((r) => ({
        ...r,
        old_value: r.old_value ? parseJson(r.old_value) : null,
        new_value: r.new_value ? parseJson(r.new_value) : null,
      })),
      total
    };
  } catch (err) {
    console.error("Failed to fetch MySQL audit logs:", err.message);
    throw err;
  }
}
