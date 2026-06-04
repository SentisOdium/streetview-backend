import pool from "../../config/db.js";

export async function getNodeDetailsId(nodeId) {
  const [rows] = await pool.query(
    `SELECT nd.id FROM node_details nd WHERE nd.node_id = ? LIMIT 1`,
    [nodeId]
  );
  return rows[0]?.id ?? null;
}

export async function getDashboardStats() {
  const [[nodes], [hotspots], [rooms], [floors]] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS count FROM node`),
    pool.query(`SELECT COUNT(*) AS count FROM node_hotspots`),
    pool.query(`SELECT COUNT(*) AS count FROM node_sprite`),
    pool.query(`SELECT COUNT(DISTINCT nd.type) AS count FROM node_details nd WHERE nd.type IS NOT NULL AND nd.type != ''`),
  ]);

  const [recent] = await pool.query(`
    SELECT n.id, nd.node_name, nd.type AS floor
    FROM node n
    INNER JOIN node_details nd ON n.id = nd.node_id
    ORDER BY n.id DESC
    LIMIT 8
  `);

  const [graphStats] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM node) AS total_nodes,
      (SELECT COUNT(*) FROM node_hotspots) AS total_edges,
      (SELECT COUNT(*) FROM node n
        LEFT JOIN node_hotspots nh ON nh.node_details_id = (
          SELECT nd2.id FROM node_details nd2 WHERE nd2.node_id = n.id LIMIT 1
        )
        WHERE nh.id IS NULL) AS orphan_nodes
  `);

  return {
    totalLocations: nodes[0].count,
    totalHotspots: hotspots[0].count,
    totalRooms: rooms[0].count,
    totalFloors: floors[0].count,
    recentlyModified: recent,
    graphStats: graphStats[0],
  };
}

export async function getAllLocationsAdmin() {
  const [rows] = await pool.query(`
    SELECT
      n.id,
      nd.node_name,
      nd.type AS floor,
      nc.coordinates,
      ni.src AS panorama_image,
      ni.alt AS image_alt,
      nd.id AS node_details_id
    FROM node n
    INNER JOIN node_details nd ON n.id = nd.node_id
    LEFT JOIN node_coordinates nc ON nd.id = nc.node_details_id
    LEFT JOIN node_img ni ON nd.id = ni.node_details_id
    ORDER BY nd.node_name ASC
  `);
  return rows;
}

export async function getLocationByIdAdmin(id) {
  const [rows] = await pool.query(`
    SELECT
      n.id,
      nd.node_name,
      nd.type AS floor,
      nc.coordinates,
      ni.src AS panorama_image,
      ni.alt AS image_alt,
      nd.id AS node_details_id
    FROM node n
    INNER JOIN node_details nd ON n.id = nd.node_id
    LEFT JOIN node_coordinates nc ON nd.id = nc.node_details_id
    LEFT JOIN node_img ni ON nd.id = ni.node_details_id
    WHERE n.id = ?
  `, [id]);
  return rows[0] ?? null;
}

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

export async function getHotspotsByNodeIdAdmin(nodeId) {
  const [rows] = await pool.query(`
    SELECT
      nh.id,
      nh.direction AS hotspot_label,
      nh.path_weight,
      nh.yaw,
      nh.pitch,
      nd2.node_id AS destination_id,
      nd2.node_name AS destination_name
    FROM node n
    INNER JOIN node_details nd ON n.id = nd.node_id
    INNER JOIN node_hotspots nh ON nd.id = nh.node_details_id
    INNER JOIN node_details nd2 ON nh.target_node_id = nd2.id
    WHERE n.id = ?
  `, [nodeId]);
  return rows;
}

export async function getAllHotspotsAdmin() {
  const [rows] = await pool.query(`
    SELECT
      nh.id,
      nd.node_name AS source_name,
      n.id AS source_id,
      nh.direction AS hotspot_label,
      nh.yaw,
      nh.pitch,
      nd2.node_id AS destination_id,
      nd2.node_name AS destination_name
    FROM node_hotspots nh
    INNER JOIN node_details nd ON nh.node_details_id = nd.id
    INNER JOIN node n ON nd.node_id = n.id
    INNER JOIN node_details nd2 ON nh.target_node_id = nd2.id
  `);
  return rows;
}

export async function createHotspotAdmin(sourceNodeId, { destination_id, hotspot_label, yaw, pitch, path_weight = 1 }) {
  const sourceDetailsId = await getNodeDetailsId(sourceNodeId);
  if (!sourceDetailsId) throw new Error("Source location not found");

  const targetDetailsId = await getNodeDetailsId(destination_id);
  if (!targetDetailsId) throw new Error("Destination location not found");

  try {
    const [result] = await pool.query(
      `INSERT INTO node_hotspots (node_details_id, target_node_id, direction, path_weight, yaw, pitch)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sourceDetailsId, targetDetailsId, hotspot_label, path_weight, yaw ?? null, pitch ?? null]
    );
    return { id: result.insertId };
  } catch (err) {
    if (err.code === "ER_BAD_FIELD_ERROR") {
      const [result] = await pool.query(
        `INSERT INTO node_hotspots (node_details_id, target_node_id, direction, path_weight)
         VALUES (?, ?, ?, ?)`,
        [sourceDetailsId, targetDetailsId, hotspot_label, path_weight]
      );
      return { id: result.insertId };
    }
    throw err;
  }
}

export async function updateHotspotAdmin(hotspotId, { destination_id, hotspot_label, yaw, pitch, path_weight }) {
  let targetDetailsId = null;
  if (destination_id) {
    targetDetailsId = await getNodeDetailsId(destination_id);
    if (!targetDetailsId) throw new Error("Destination not found");
  }

  try {
    await pool.query(
      `UPDATE node_hotspots SET
        target_node_id = COALESCE(?, target_node_id),
        direction = COALESCE(?, direction),
        path_weight = COALESCE(?, path_weight),
        yaw = COALESCE(?, yaw),
        pitch = COALESCE(?, pitch)
       WHERE id = ?`,
      [targetDetailsId, hotspot_label, path_weight, yaw, pitch, hotspotId]
    );
  } catch (err) {
    if (err.code === "ER_BAD_FIELD_ERROR") {
      await pool.query(
        `UPDATE node_hotspots SET
          target_node_id = COALESCE(?, target_node_id),
          direction = COALESCE(?, direction),
          path_weight = COALESCE(?, path_weight)
         WHERE id = ?`,
        [targetDetailsId, hotspot_label, path_weight, hotspotId]
      );
    } else {
      throw err;
    }
  }
  return { updated: true };
}

export async function deleteHotspotAdmin(hotspotId) {
  await pool.query(`DELETE FROM node_hotspots WHERE id = ?`, [hotspotId]);
  return { deleted: true };
}

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

export async function createRoomAdmin(nodeId, room) {
  const detailsId = await getNodeDetailsId(nodeId);
  if (!detailsId) throw new Error("Location not found");

  const [result] = await pool.query(
    `INSERT INTO node_sprite (node_details_id, room_number, room_type, room_img, room_description)
     VALUES (?, ?, ?, ?, ?)`,
    [detailsId, room.room_number, room.room_type, room.room_img, room.room_description]
  );
  return { id: result.insertId };
}

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

export async function deleteRoomAdmin(roomId) {
  await pool.query(`DELETE FROM node_sprite WHERE id = ?`, [roomId]);
  return { deleted: true };
}

export async function getGraphDataAdmin() {
  const [nodes] = await pool.query(`
    SELECT n.id, nd.node_name, nd.type AS floor
    FROM node n
    INNER JOIN node_details nd ON n.id = nd.node_id
  `);

  const [edges] = await pool.query(`
    SELECT nh.id, n.id AS source, nd2.node_id AS target, nh.direction AS label
    FROM node_hotspots nh
    INNER JOIN node_details nd ON nh.node_details_id = nd.id
    INNER JOIN node n ON nd.node_id = n.id
    INNER JOIN node_details nd2 ON nh.target_node_id = nd2.id
  `);

  return { nodes, edges };
}

export async function exportAllDataAdmin() {
  const locations = await getAllLocationsAdmin();
  const hotspots = await getAllHotspotsAdmin();
  const [rooms] = await pool.query(`
    SELECT ns.*, nd.node_name AS location_name, n.id AS location_id
    FROM node_sprite ns
    INNER JOIN node_details nd ON ns.node_details_id = nd.id
    INNER JOIN node n ON nd.node_id = n.id
  `);
  return { locations, hotspots, rooms, exported_at: new Date().toISOString() };
}
