import pool from "../../../config/db.js";

export async function getNodeDetailsId(nodeId) {
  const [rows] = await pool.query(
    `SELECT nd.id FROM node_details nd WHERE nd.node_id = ? LIMIT 1`,
    [nodeId]
  );
  return rows[0]?.id ?? null;
}
