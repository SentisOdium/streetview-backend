import pool from "../../../config/db.js";

export async function getHotspotsByNodeIdAdmin(nodeId) {
  const [rows] = await pool.query(`
    SELECT
      nh.id,
      nh.direction AS hotspot_label,
      nh.path_weight,
      nh.yaw,
      nh.pitch,
      nd2.node_id AS destination_id,
      nd2.node_name AS destination_name
    FROM node n
    INNER JOIN node_details nd ON n.id = nd.node_id
    INNER JOIN node_hotspots nh ON nd.id = nh.node_details_id
    INNER JOIN node_details nd2 ON nh.target_node_id = nd2.id
    WHERE n.id = ?
  `, [nodeId]);
  return rows;
}
