import pool from "../../../config/db.js";

export async function updateRoomAdmin(roomId, room) {
  await pool.query(
    `UPDATE node_sprite SET
      room_number = COALESCE(?, room_number),
      room_type = COALESCE(?, room_type),
      room_img = COALESCE(?, room_img),
      room_description = COALESCE(?, room_description)
     WHERE id = ?`,
    [room.room_number, room.room_type, room.room_img, room.room_description, roomId]
  );
  return { updated: true };
}
