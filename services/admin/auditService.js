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

export async function getAuditLogs({
  limit = 50,
  offset = 0,
  search,
  entityType,
  adminUser,
  action,
  date,
} = {}) {
  try {
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push("(admin_user LIKE ? OR action LIKE ? OR location_name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (entityType) {
      conditions.push("entity_type = ?");
      params.push(entityType);
    }

    if (adminUser) {
      conditions.push("admin_user LIKE ?");
      params.push(`%${adminUser}%`);
    }

    if (action) {
      conditions.push("action LIKE ?");
      params.push(`%${action}%`);
    }

    if (date) {
      conditions.push("created_at >= ? AND created_at <= ?");
      params.push(`${date} 00:00:00`, `${date} 23:59:59`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM audit_log ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT id, action, entity_type, entity_id, location_name, admin_user,
              old_value, new_value, created_at
       FROM audit_log
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
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
