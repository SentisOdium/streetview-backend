import pool from '../../config/db.js';

async function addRotationOffsetXZ() {
  try {
    const [colsX] = await pool.query("SHOW COLUMNS FROM node_img LIKE 'rotation_offset_x'");
    if (colsX.length === 0) {
      await pool.query("ALTER TABLE node_img ADD COLUMN rotation_offset_x FLOAT DEFAULT 0.0");
      console.log("Column 'rotation_offset_x' added successfully.");
    } else {
      console.log("Column 'rotation_offset_x' already exists.");
    }

    const [colsZ] = await pool.query("SHOW COLUMNS FROM node_img LIKE 'rotation_offset_z'");
    if (colsZ.length === 0) {
      await pool.query("ALTER TABLE node_img ADD COLUMN rotation_offset_z FLOAT DEFAULT 0.0");
      console.log("Column 'rotation_offset_z' added successfully.");
    } else {
      console.log("Column 'rotation_offset_z' already exists.");
    }
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

addRotationOffsetXZ();
