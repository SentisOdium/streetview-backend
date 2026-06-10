import pool from "../../../config/db.js";

export async function createLocationAdmin({ node_name, coordinates, panorama_image, description, floor }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [nodeResult] = await conn.query(`INSERT INTO node DEFAULT VALUES`);
    const nodeId = nodeResult.insertId;

    const [detailsResult] = await conn.query(
      `INSERT INTO node_details (node_id, node_name, type) VALUES (?, ?, ?)`,
      [nodeId, node_name, floor || description || "general"]
    );
    const detailsId = detailsResult.insertId;

    if (coordinates) {
      await conn.query(
        `INSERT INTO node_coordinates (node_details_id, coordinates) VALUES (?, ?)`,
        [detailsId, coordinates]
      );
    }

    if (panorama_image) {
      await conn.query(
        `INSERT INTO node_img (node_details_id, src, alt) VALUES (?, ?, ?)`,
        [detailsId, panorama_image, node_name]
      );
    }

    await conn.commit();
    return { id: nodeId, node_details_id: detailsId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
