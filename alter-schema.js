import pool from './config/db.js';

async function alterTable() {
  try {
    await pool.query("ALTER TABLE admins ADD COLUMN first_name VARCHAR(50)");
    await pool.query("ALTER TABLE admins ADD COLUMN middle_initial VARCHAR(10)");
    await pool.query("ALTER TABLE admins ADD COLUMN last_name VARCHAR(50)");
    
    // Attempt to migrate existing data (just put full_name into first_name for now)
    await pool.query("UPDATE admins SET first_name = full_name");
    
    await pool.query("ALTER TABLE admins DROP COLUMN full_name");
    console.log("Table altered successfully.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

alterTable();
