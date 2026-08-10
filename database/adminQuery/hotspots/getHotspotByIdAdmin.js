import pool from "../../../config/db.js";

export async function getHotspotByIdAdmin(hotspotId) {
  const [rows] = await pool.query(
    `SELECT nh.id, nh.yaw, nh.pitch, nh.marker_width, nh.marker_height, nh.path_weight, nh.direction AS hotspot_label, nh.target_node_id,
            nd.node_name AS source_name, nd2.node_name AS destination_name
     FROM node_hotspots nh
     INNER JOIN node_details nd ON nh.node_details_id = nd.id
     INNER JOIN node_details nd2 ON nh.target_node_id = nd2.id
     WHERE nh.id = ?`,
    [hotspotId]
  );
  return rows[0] ?? null;
}
