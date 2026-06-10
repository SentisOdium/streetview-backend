import pool from "../../../config/db.js";

export async function deleteHotspotAdmin(hotspotId) {
  await pool.query(`DELETE FROM node_hotspots WHERE id = ?`, [hotspotId]);
  return { deleted: true };
}
