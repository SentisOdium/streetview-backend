import pool from '../../config/db.js';

const directionYawMap = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SW: -135,
  W: -90,
  NW: -45,
};

async function migrateHotspotYaw() {
  try {
    console.log("Migrating node_hotspots yaw values based on direction labels...");

    const [hotspots] = await pool.query("SELECT id, direction, yaw, pitch FROM node_hotspots");
    console.log(`Found ${hotspots.length} hotspots in database.`);

    let updatedCount = 0;

    for (const h of hotspots) {
      const dir = (h.direction || "").trim().toUpperCase();
      const targetYaw = directionYawMap[dir];

      if (targetYaw !== undefined) {
        if (h.yaw === null || (h.yaw === 0 && dir !== 'N')) {
          await pool.query(
            "UPDATE node_hotspots SET yaw = ?, pitch = COALESCE(pitch, 0) WHERE id = ?",
            [targetYaw, h.id]
          );
          updatedCount++;
        }
      }
    }

    console.log(`Successfully updated ${updatedCount} hotspot positions to match their 8-direction labels.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateHotspotYaw();
