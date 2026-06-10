import pool from "../../../config/db.js";

export async function getAllHotspotsAdmin() {
  const [rows] = await pool.query(`
    SELECT
      nh.id,
      nd.node_name AS source_name,
      n.id AS source_id,
      nh.direction AS hotspot_label,
      nh.yaw,
      nh.pitch,
      nd2.node_id AS destination_id,
      nd2.node_name AS destination_name
    FROM node_hotspots nh
    INNER JOIN node_details nd ON nh.node_details_id = nd.id
    INNER JOIN node n ON nd.node_id = n.id
    INNER JOIN node_details nd2 ON nh.target_node_id = nd2.id
  `);
  return rows;
}
