import pool from "../../../config/db.js";
import { getAllLocationsAdmin } from "../locations/getAllLocationsAdmin.js";
import { getAllHotspotsAdmin } from "../hotspots/getAllHotspotsAdmin.js";

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
