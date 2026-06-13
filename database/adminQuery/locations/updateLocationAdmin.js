import pool from "../../../config/db.js";
import { getNodeDetailsId } from "../utils/getNodeDetailsId.js";
import { getLocationByIdAdmin } from "./getLocationByIdAdmin.js";

export async function updateLocationAdmin(id, { node_name, panorama_image, rotation_offset, rotation_offset_x, rotation_offset_z, description, floor }) {
  const detailsId = await getNodeDetailsId(id);
  if (!detailsId) throw new Error("Location not found");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE node_details SET node_name = COALESCE(?, node_name), type = COALESCE(?, type) WHERE id = ?`,
      [node_name, floor || description, detailsId]
    );

    if (panorama_image !== undefined || rotation_offset !== undefined || rotation_offset_x !== undefined || rotation_offset_z !== undefined) {
      const [existing] = await conn.query(`SELECT id FROM node_img WHERE node_details_id = ?`, [detailsId]);
      if (existing.length) {
        await conn.query(
          `UPDATE node_img SET src = COALESCE(?, src), rotation_offset = COALESCE(?, rotation_offset), rotation_offset_x = COALESCE(?, rotation_offset_x), rotation_offset_z = COALESCE(?, rotation_offset_z), alt = COALESCE(?, alt) WHERE node_details_id = ?`,
          [
            panorama_image !== undefined ? panorama_image : null,
            rotation_offset !== undefined ? rotation_offset : null,
            rotation_offset_x !== undefined ? rotation_offset_x : null,
            rotation_offset_z !== undefined ? rotation_offset_z : null,
            node_name !== undefined ? node_name : null,
            detailsId
          ]
        );
      } else {
        await conn.query(
          `INSERT INTO node_img (node_details_id, src, alt, rotation_offset, rotation_offset_x, rotation_offset_z) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            detailsId,
            panorama_image || "",
            node_name || "",
            rotation_offset !== undefined ? rotation_offset : 0.0,
            rotation_offset_x !== undefined ? rotation_offset_x : 0.0,
            rotation_offset_z !== undefined ? rotation_offset_z : 0.0
          ]
        );
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
