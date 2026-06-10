import pool from "../../../config/db.js";

export async function getGraphDataAdmin() {
  const [nodes] = await pool.query(`
    SELECT n.id, nd.node_name, nd.type AS floor
    FROM node n
    INNER JOIN node_details nd ON n.id = nd.node_id
  `);

  const [edges] = await pool.query(`
    SELECT nh.id, n.id AS source, nd2.node_id AS target, nh.direction AS label
    FROM node_hotspots nh
    INNER JOIN node_details nd ON nh.node_details_id = nd.id
    INNER JOIN node n ON nd.node_id = n.id
    INNER JOIN node_details nd2 ON nh.target_node_id = nd2.id
  `);

  return { nodes, edges };
}
