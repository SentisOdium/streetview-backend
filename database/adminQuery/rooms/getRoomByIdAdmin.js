import pool from "../../../config/db.js";

export async function getRoomByIdAdmin(roomId) {
  const [rows] = await pool.query(
    `SELECT ns.id, ns.room_number, ns.room_type, ns.room_img, ns.room_description, ns.phone, ns.hours, nd.node_name
     FROM node_sprite ns
     INNER JOIN node_details nd ON ns.node_details_id = nd.id
     WHERE ns.id = ?`,
    [roomId]
  );
  return rows[0] ?? null;
}
