import pool from "../../../config/db.js";
import { getNodeDetailsId } from "../utils/getNodeDetailsId.js";

export async function createRoomAdmin(nodeId, room) {
  const detailsId = await getNodeDetailsId(nodeId);
  if (!detailsId) throw new Error("Location not found");

  const [result] = await pool.query(
    `INSERT INTO node_sprite (node_details_id, room_number, room_type, room_img, room_description, phone, hours)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [detailsId, room.room_number, room.room_type, room.room_img, room.room_description, room.phone || null, room.hours || null]
  );
  return { id: result.insertId };
}
