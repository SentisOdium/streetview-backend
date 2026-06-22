import pool from "../../../config/db.js";
import { getNodeDetailsId } from "../utils/getNodeDetailsId.js";

export async function updateCoordinatesAdmin(nodeId, coordinates, floor) {
  const detailsId = await getNodeDetailsId(nodeId);
  if (!detailsId) throw new Error("Location not found");

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if coordinates entry already exists for this node details
    const [existing] = await conn.query(
      `SELECT id FROM node_coordinates WHERE node_details_id = ?`,
      [detailsId]
    );

    if (existing.length > 0) {
      // Update existing record
      await conn.query(
        `UPDATE node_coordinates SET coordinates = ?, floor = ? WHERE node_details_id = ?`,
        [coordinates, floor, detailsId]
      );
    } else {
      // Insert new record
      await conn.query(
        `INSERT INTO node_coordinates (node_details_id, coordinates, floor) VALUES (?, ?, ?)`,
        [detailsId, coordinates, floor]
      );
    }

    await conn.commit();
    return { success: true, nodeId, coordinates, floor };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
