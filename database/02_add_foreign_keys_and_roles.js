import pool from '../config/db.js';

async function checkConstraintExists(tableName, constraintName) {
  const [rows] = await pool.query(`
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
      AND TABLE_NAME = ? 
      AND CONSTRAINT_NAME = ?
  `, [tableName, constraintName]);
  return rows.length > 0;
}

async function runMigration() {
  try {
    console.log("Starting DB Security & Schema Migrations...");

    // 1. Add role column to admins if it doesn't exist
    const [columns] = await pool.query("SHOW COLUMNS FROM admins LIKE 'role'");
    if (columns.length === 0) {
      await pool.query("ALTER TABLE admins ADD COLUMN role VARCHAR(20) DEFAULT 'admin'");
      console.log("Column 'role' added to 'admins' table.");
    } else {
      console.log("Column 'role' already exists in 'admins' table.");
    }

    // 2. Promote admin@wayfinder.com to super_admin
    const [updateAdminRes] = await pool.query(
      "UPDATE admins SET role = 'super_admin' WHERE email = 'admin@wayfinder.com'"
    );
    if (updateAdminRes.affectedRows > 0) {
      console.log("Promoted initial admin (admin@wayfinder.com) to super_admin.");
    }

    // 3. Create floors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS floors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        level INT NOT NULL
      ) ENGINE=InnoDB
    `);
    console.log("Table 'floors' checked/created successfully.");

    // Seed initial floors if empty
    const [existingFloors] = await pool.query("SELECT COUNT(*) AS count FROM floors");
    if (existingFloors[0].count === 0) {
      await pool.query(`
        INSERT INTO floors (name, level) VALUES 
        ('1st Floor', 1),
        ('2nd Floor', 2),
        ('3rd Floor', 3)
      `);
      console.log("Seeded initial floor mappings into 'floors'.");
    }

    // 4. Clean orphan records first to prevent foreign key errors during alter
    // (In case any dev DB has dirty records)
    console.log("Cleaning orphan records to ensure smooth foreign key attachment...");
    
    // Clean node_details whose node_id doesn't exist in node
    const [orphDetails] = await pool.query("DELETE FROM node_details WHERE node_id NOT IN (SELECT id FROM node)");
    if (orphDetails.affectedRows > 0) console.log(`Cleared ${orphDetails.affectedRows} orphan node_details.`);

    // Clean node_img referencing missing node_details
    const [orphImg] = await pool.query("DELETE FROM node_img WHERE node_details_id NOT IN (SELECT id FROM node_details)");
    if (orphImg.affectedRows > 0) console.log(`Cleared ${orphImg.affectedRows} orphan node_img.`);

    // Clean node_coordinates referencing missing node_details
    const [orphCoords] = await pool.query("DELETE FROM node_coordinates WHERE node_details_id NOT IN (SELECT id FROM node_details)");
    if (orphCoords.affectedRows > 0) console.log(`Cleared ${orphCoords.affectedRows} orphan node_coordinates.`);

    // Clean node_hotspots referencing missing node_details or target
    const [orphHotspots1] = await pool.query("DELETE FROM node_hotspots WHERE node_details_id NOT IN (SELECT id FROM node_details)");
    const [orphHotspots2] = await pool.query("DELETE FROM node_hotspots WHERE target_node_id NOT IN (SELECT id FROM node_details)");
    if (orphHotspots1.affectedRows + orphHotspots2.affectedRows > 0) {
      console.log(`Cleared ${orphHotspots1.affectedRows + orphHotspots2.affectedRows} orphan node_hotspots.`);
    }

    // Clean node_sprite referencing missing node_details
    const [orphSprite] = await pool.query("DELETE FROM node_sprite WHERE node_details_id NOT IN (SELECT id FROM node_details)");
    if (orphSprite.affectedRows > 0) console.log(`Cleared ${orphSprite.affectedRows} orphan node_sprite.`);

    // 5. Establish foreign keys with cascade deletes
    const foreignKeys = [
      {
        table: 'node_details',
        constraint: 'fk_node_details_node',
        alterSql: 'ALTER TABLE node_details ADD CONSTRAINT fk_node_details_node FOREIGN KEY (node_id) REFERENCES node(id) ON DELETE CASCADE'
      },
      {
        table: 'node_img',
        constraint: 'fk_node_img_node_details',
        alterSql: 'ALTER TABLE node_img ADD CONSTRAINT fk_node_img_node_details FOREIGN KEY (node_details_id) REFERENCES node_details(id) ON DELETE CASCADE'
      },
      {
        table: 'node_coordinates',
        constraint: 'fk_node_coordinates_node_details',
        alterSql: 'ALTER TABLE node_coordinates ADD CONSTRAINT fk_node_coordinates_node_details FOREIGN KEY (node_details_id) REFERENCES node_details(id) ON DELETE CASCADE'
      },
      {
        table: 'node_hotspots',
        constraint: 'fk_node_hotspots_node_details',
        alterSql: 'ALTER TABLE node_hotspots ADD CONSTRAINT fk_node_hotspots_node_details FOREIGN KEY (node_details_id) REFERENCES node_details(id) ON DELETE CASCADE'
      },
      {
        table: 'node_hotspots',
        constraint: 'fk_node_hotspots_target_node',
        alterSql: 'ALTER TABLE node_hotspots ADD CONSTRAINT fk_node_hotspots_target_node FOREIGN KEY (target_node_id) REFERENCES node_details(id) ON DELETE CASCADE'
      },
      {
        table: 'node_sprite',
        constraint: 'fk_node_sprite_node_details',
        alterSql: 'ALTER TABLE node_sprite ADD CONSTRAINT fk_node_sprite_node_details FOREIGN KEY (node_details_id) REFERENCES node_details(id) ON DELETE CASCADE'
      }
    ];

    for (const fk of foreignKeys) {
      const exists = await checkConstraintExists(fk.table, fk.constraint);
      if (!exists) {
        await pool.query(fk.alterSql);
        console.log(`Foreign key constraint '${fk.constraint}' added successfully.`);
      } else {
        console.log(`Foreign key constraint '${fk.constraint}' already exists.`);
      }
    }

    console.log("All DB Security & Schema Migrations completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Database migration failed:", error);
    process.exit(1);
  }
}

runMigration();
