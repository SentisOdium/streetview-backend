import pool from "../../../config/db.js";

export async function getPaginatedLocationsAdmin({ floor, search, limit, offset }) {
  let baseQuery = `
    FROM node n
    INNER JOIN node_details nd ON n.id = nd.node_id
    LEFT JOIN node_img ni ON nd.id = ni.node_details_id
    LEFT JOIN node_coordinates nc ON nd.id = nc.node_details_id
  `;
  const conditions = [];
  const params = [];
  
  if (floor) {
    conditions.push("nd.type = ?");
    params.push(floor);
  }
  
  if (search) {
    conditions.push("nd.node_name LIKE ?");
    params.push(`%${search}%`);
  }
  
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  
  // Get total count
  const countQuery = `SELECT COUNT(*) AS total ${baseQuery} ${whereClause}`;
  const [[{ total }]] = await pool.query(countQuery, params);
  
  // Get paginated rows
  const selectQuery = `
    SELECT
      n.id,
      nd.node_name,
      nd.type AS floor,
      ni.src AS panorama_image,
      ni.alt AS image_alt,
      ni.rotation_offset,
      ni.rotation_offset_x,
      ni.rotation_offset_z,
      nd.id AS node_details_id,
      nc.coordinates,
      nc.floor AS coordinate_floor
    ${baseQuery}
    ${whereClause}
    ORDER BY nd.node_name ASC
    LIMIT ? OFFSET ?
  `;
  
  const [rows] = await pool.query(selectQuery, [...params, limit, offset]);
  return { locations: rows, total };
}
