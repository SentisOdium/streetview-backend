import pool from '../../config/db.js';

async function runMigration() {
  try {
    console.log("Starting DB Address Columns Migration...");

    const columnsToAdd = [
      { name: 'street_address', type: 'VARCHAR(255) NULL' },
      { name: 'barangay', type: 'VARCHAR(100) NULL' },
      { name: 'city', type: 'VARCHAR(100) NULL' },
      { name: 'province', type: 'VARCHAR(100) NULL' },
      { name: 'postal_code', type: 'VARCHAR(20) NULL' }
    ];

    for (const col of columnsToAdd) {
      const [columns] = await pool.query(`SHOW COLUMNS FROM admins LIKE '${col.name}'`);
      if (columns.length === 0) {
        await pool.query(`ALTER TABLE admins ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Column '${col.name}' added to 'admins' table.`);
      } else {
        console.log(`Column '${col.name}' already exists in 'admins' table.`);
      }
    }

    console.log("DB Address Columns Migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Database migration failed:", error);
    process.exit(1);
  }
}

runMigration();
