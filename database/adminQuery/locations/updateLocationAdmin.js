import pool from "../../../config/db.js";
import { getNodeDetailsId } from "../utils/getNodeDetailsId.js";
import { getLocationByIdAdmin } from "./getLocationByIdAdmin.js";

export async function updateLocationAdmin(id, { node_name, coordinates, panorama_image, description, floor }) {
  const detailsId = await getNodeDetailsId(id);
  if (!detailsId) throw new Error("Location not found");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE node_details SET node_name = COALESCE(?, node_name), type = COALESCE(?, type) WHERE id = ?`,
      [node_name, floor || description, detailsId]
    );

    if (coordinates !== undefined) {
      const [existing] = await conn.query(
        `SELECT id FROM node_coordinates WHERE node_details_id = ?`,
        [detailsId]
      );
      if (existing.length) {
        await conn.query(`UPDATE node_coordinates SET coordinates = ? WHERE node_details_id = ?`, [coordinates, detailsId]);
      } else {
        await conn.query(`INSERT INTO node_coordinates (node_details_id, coordinates) VALUES (?, ?)`, [detailsId, coordinates]);
      }
    }

    if (panorama_image !== undefined) {
      const [existing] = await conn.query(`SELECT id FROM node_img WHERE node_details_id = ?`, [detailsId]);
      if (existing.length) {
        await conn.query(`UPDATE node_img SET src = ?, alt = COALESCE(?, alt) WHERE node_details_id = ?`, [panorama_image, node_name, detailsId]);
      } else {
        await conn.query(`INSERT INTO node_img (node_details_id, src, alt) VALUES (?, ?, ?)`, [detailsId, panorama_image, node_name || ""]);
      }
    }

    await conn.commit();
    return getLocationByIdAdmin(id);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
