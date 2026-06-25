import pool from '../../config/db.js';

async function addFloorColumn() {
  try {
    // 1. Add column floor if it doesn't exist
    const [columns] = await pool.query("SHOW COLUMNS FROM node_coordinates LIKE 'floor'");
    if (columns.length === 0) {
      await pool.query("ALTER TABLE node_coordinates ADD COLUMN floor VARCHAR(50) DEFAULT '1'");
      console.log("Column 'floor' added successfully to 'node_coordinates' table.");
    } else {
      console.log("Column 'floor' already exists in 'node_coordinates' table.");
    }

    // 2. Map existing coordinates based on nd.type
    console.log("Seeding existing coordinates floors based on node type...");

    // Set floor = '2' for second floor nodes
    const [res2] = await pool.query(`
      UPDATE node_coordinates nc
      JOIN node_details nd ON nc.node_details_id = nd.id
      SET nc.floor = '2'
      WHERE nd.type LIKE '%second%' OR nd.type LIKE '%2%'
    `);
    console.log(`Updated ${res2.affectedRows} nodes to Floor 2 coordinates.`);

    // Set floor = '3' for third floor nodes
    const [res3] = await pool.query(`
      UPDATE node_coordinates nc
      JOIN node_details nd ON nc.node_details_id = nd.id
      SET nc.floor = '3'
      WHERE nd.type LIKE '%third%' OR nd.type LIKE '%3%'
    `);
    console.log(`Updated ${res3.affectedRows} nodes to Floor 3 coordinates.`);

    console.log("Migration and seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

addFloorColumn();
