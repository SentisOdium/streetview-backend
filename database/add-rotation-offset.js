import pool from '../config/db.js';

async function addRotationOffsetColumn() {
  try {
    // Add column rotation_offset if not already exists
    const [columns] = await pool.query("SHOW COLUMNS FROM node_img LIKE 'rotation_offset'");
    if (columns.length === 0) {
      await pool.query("ALTER TABLE node_img ADD COLUMN rotation_offset FLOAT DEFAULT 0.0");
      console.log("Column 'rotation_offset' added successfully to 'node_img' table.");
    } else {
      console.log("Column 'rotation_offset' already exists in 'node_img' table.");
    }
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

addRotationOffsetColumn();
