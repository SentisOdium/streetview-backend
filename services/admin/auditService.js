import pool from "../../config/db.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_FILE = path.join(__dirname, "../../data/audit-logs.json");

async function ensureAuditFile() {
  try {
    await fs.access(AUDIT_FILE);
  } catch {
    await fs.mkdir(path.dirname(AUDIT_FILE), { recursive: true });
    await fs.writeFile(AUDIT_FILE, "[]", "utf-8");
  }
}

async function writeFileLog(entry) {
  await ensureAuditFile();
  const raw = await fs.readFile(AUDIT_FILE, "utf-8");
  const logs = JSON.parse(raw);
  logs.unshift({ ...entry, id: Date.now(), created_at: new Date().toISOString() });
  await fs.writeFile(AUDIT_FILE, JSON.stringify(logs.slice(0, 500), null, 2), "utf-8");
}

export async function logAudit({
  action,
  entityType,
  entityId = null,
  locationName = null,
  adminUser = "admin",
  oldValue = null,
  newValue = null,
}) {
  const entry = {
    action,
    entity_type: entityType,
    entity_id: entityId,
    location_name: locationName,
    admin_user: adminUser,
    old_value: oldValue,
    new_value: newValue,
  };

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
  } catch {
    await writeFileLog(entry);
  }
}

export async function getAuditLogs({ limit = 50, offset = 0 } = {}) {
  try {
    const [rows] = await pool.query(
      `SELECT id, action, entity_type, entity_id, location_name, admin_user,
              old_value, new_value, created_at
       FROM audit_log
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows.map((r) => ({
      ...r,
      old_value: r.old_value ? JSON.parse(r.old_value) : null,
      new_value: r.new_value ? JSON.parse(r.new_value) : null,
    }));
  } catch {
    await ensureAuditFile();
    const raw = await fs.readFile(AUDIT_FILE, "utf-8");
    const logs = JSON.parse(raw);
    return logs.slice(offset, offset + limit);
  }
}
