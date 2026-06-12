import pool from "../../../config/db.js";

export async function getLocationByIdAdmin(id) {
  const [rows] = await pool.query(`
    SELECT
      n.id,
      nd.node_name,
      nd.type AS floor,
      nc.coordinates,
      ni.src AS panorama_image,
      ni.alt AS image_alt,
      ni.rotation_offset,
      ni.rotation_offset_x,
      ni.rotation_offset_z,
      nd.id AS node_details_id
    FROM node n
    INNER JOIN node_details nd ON n.id = nd.node_id
    LEFT JOIN node_coordinates nc ON nd.id = nc.node_details_id
    LEFT JOIN node_img ni ON nd.id = ni.node_details_id
    WHERE n.id = ?
  `, [id]);
  return rows[0] ?? null;
}
