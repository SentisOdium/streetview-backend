import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  try {
    const sqlFile = path.join(__dirname, 'migrations', '01_create_admin_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    // Split queries by semicolon (basic parsing)
    const queries = sql.split(';').filter(q => q.trim().length > 0);
    
    for (let query of queries) {
      await pool.query(query);
      console.log('Executed query successfully.');
    }
    
    console.log('Migrations completed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
