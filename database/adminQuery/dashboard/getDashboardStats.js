import pool from "../../../config/db.js";

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
