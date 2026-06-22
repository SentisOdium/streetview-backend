import pool from "../../../config/db.js";

export async function getCoordinatesAdmin() {
  const [rows] = await pool.query(`
    SELECT 
      nc.id,
      nc.node_details_id,
      nd.node_id,
      nd.node_name,
      nc.coordinates,
      nc.floor
    FROM node_coordinates nc
    INNER JOIN node_details nd ON nc.node_details_id = nd.id
  `);
  return rows;
}
