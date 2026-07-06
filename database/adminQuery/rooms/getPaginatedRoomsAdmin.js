import pool from "../../../config/db.js";

export async function getPaginatedRoomsAdmin({ search, limit, offset }) {
  let baseQuery = `
    FROM node_sprite ns
    INNER JOIN node_details nd ON ns.node_details_id = nd.id
  `;
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push("(ns.room_number LIKE ? OR ns.room_type LIKE ? OR nd.node_name LIKE ?)");
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count
  const countQuery = `SELECT COUNT(*) AS total ${baseQuery} ${whereClause}`;
  const [[{ total }]] = await pool.query(countQuery, params);

  // Get paginated rows
  const selectQuery = `
    SELECT
      ns.id,
      ns.room_number,
      ns.room_type,
      ns.room_img,
      ns.room_description,
      ns.phone,
      ns.hours,
      nd.node_name,
      nd.node_id
    ${baseQuery}
    ${whereClause}
    ORDER BY nd.node_name ASC, ns.room_number ASC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.query(selectQuery, [...params, limit, offset]);
  return { rooms: rows, total };
}
