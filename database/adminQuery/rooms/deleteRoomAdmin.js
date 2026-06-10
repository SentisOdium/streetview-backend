import pool from "../../../config/db.js";

export async function deleteRoomAdmin(roomId) {
  await pool.query(`DELETE FROM node_sprite WHERE id = ?`, [roomId]);
  return { deleted: true };
}
