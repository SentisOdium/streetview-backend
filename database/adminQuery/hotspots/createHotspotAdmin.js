import pool from "../../../config/db.js";
import { getNodeDetailsId } from "../utils/getNodeDetailsId.js";

export async function createHotspotAdmin(sourceNodeId, { destination_id, hotspot_label, yaw, pitch, path_weight = 1 }) {
  const sourceDetailsId = await getNodeDetailsId(sourceNodeId);
  if (!sourceDetailsId) throw new Error("Source location not found");

  const targetDetailsId = await getNodeDetailsId(destination_id);
  if (!targetDetailsId) throw new Error("Destination location not found");

  try {
    const [result] = await pool.query(
      `INSERT INTO node_hotspots (node_details_id, target_node_id, direction, path_weight, yaw, pitch)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sourceDetailsId, targetDetailsId, hotspot_label, path_weight, yaw ?? null, pitch ?? null]
    );
    return { id: result.insertId };
  } catch (err) {
    if (err.code === "ER_BAD_FIELD_ERROR") {
      const [result] = await pool.query(
        `INSERT INTO node_hotspots (node_details_id, target_node_id, direction, path_weight)
         VALUES (?, ?, ?, ?)`,
        [sourceDetailsId, targetDetailsId, hotspot_label, path_weight]
      );
      return { id: result.insertId };
    }
    throw err;
  }
}
