import pool from "../../../config/db.js";
import { getNodeDetailsId } from "../utils/getNodeDetailsId.js";

export async function updateHotspotAdmin(hotspotId, { destination_id, hotspot_label, yaw, pitch, path_weight, marker_width, marker_height }) {
  let targetDetailsId = null;
  if (destination_id) {
    targetDetailsId = await getNodeDetailsId(destination_id);
    if (!targetDetailsId) throw new Error("Destination not found");
  }

  try {
    await pool.query(
      `UPDATE node_hotspots SET
        target_node_id = COALESCE(?, target_node_id),
        direction = COALESCE(?, direction),
        path_weight = COALESCE(?, path_weight),
        yaw = COALESCE(?, yaw),
        pitch = COALESCE(?, pitch),
        marker_width = COALESCE(?, marker_width),
        marker_height = COALESCE(?, marker_height)
       WHERE id = ?`,
      [targetDetailsId, hotspot_label, path_weight, yaw, pitch, marker_width, marker_height, hotspotId]
    );
  } catch (err) {
    if (err.code === "ER_BAD_FIELD_ERROR") {
      await pool.query(
        `UPDATE node_hotspots SET
          target_node_id = COALESCE(?, target_node_id),
          direction = COALESCE(?, direction),
          path_weight = COALESCE(?, path_weight)
         WHERE id = ?`,
        [targetDetailsId, hotspot_label, path_weight, hotspotId]
      );
    } else {
      throw err;
    }
  }
  return { updated: true };
}
