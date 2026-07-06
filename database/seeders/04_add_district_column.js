import pool from '../../config/db.js';

async function runMigration() {
  try {
    console.log("Starting DB District Column Migration...");

    const [columns] = await pool.query(`SHOW COLUMNS FROM admins LIKE 'district'`);
    if (columns.length === 0) {
      await pool.query(`ALTER TABLE admins ADD COLUMN district VARCHAR(100) NULL`);
      console.log(`Column 'district' added to 'admins' table.`);
    } else {
      console.log(`Column 'district' already exists in 'admins' table.`);
    }

    console.log("DB District Column Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Database migration failed:", error);
    process.exit(1);
  }
}

runMigration();
