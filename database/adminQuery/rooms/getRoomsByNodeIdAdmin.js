import pool from "../../../config/db.js";
import { getNodeDetailsId } from "../utils/getNodeDetailsId.js";

export async function getRoomsByNodeIdAdmin(nodeId) {
  const detailsId = await getNodeDetailsId(nodeId);
  if (!detailsId) return [];
  const [rows] = await pool.query(
    `SELECT id, room_number, room_type, room_img, room_description
     FROM node_sprite WHERE node_details_id = ?`,
    [detailsId]
  );
  return rows;
}
