import pool from './config/db.js';

async function test() {
  try {
    const [rows] = await pool.query("SELECT * FROM admins");
    console.log("Admins:");
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
test();
