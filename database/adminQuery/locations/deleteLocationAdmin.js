import pool from "../../../config/db.js";
import { getNodeDetailsId } from "../utils/getNodeDetailsId.js";

export async function deleteLocationAdmin(id) {
  const detailsId = await getNodeDetailsId(id);
  if (!detailsId) throw new Error("Location not found");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM node_hotspots WHERE node_details_id = ? OR target_node_id = ?`, [detailsId, detailsId]);
    await conn.query(`DELETE FROM node_sprite WHERE node_details_id = ?`, [detailsId]);
    await conn.query(`DELETE FROM node_img WHERE node_details_id = ?`, [detailsId]);
    await conn.query(`DELETE FROM node_coordinates WHERE node_details_id = ?`, [detailsId]);
    await conn.query(`DELETE FROM node_details WHERE id = ?`, [detailsId]);
    await conn.query(`DELETE FROM node WHERE id = ?`, [id]);
    await conn.commit();
    return { deleted: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
