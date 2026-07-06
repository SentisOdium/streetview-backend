import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_AWS_HOST,
    user: process.env.MYSQL_AWS_USER,
    password: process.env.MYSQL_AWS_PASSWORD,
    database: process.env.MYSQL_AWS_DATABASE,
    port: process.env.MYSQL_AWS_PORT,
    connectionLimit: 25, // Adjust the connection limit as needed
    timezone: "Z"
});

// Self-healing database check: add deleted_at column to admins if it doesn't exist
(async () => {
  try {
    const [columns] = await pool.query("SHOW COLUMNS FROM admins LIKE 'deleted_at'");
    if (columns.length === 0) {
      await pool.query("ALTER TABLE admins ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL");
      console.log("Self-healing: Added 'deleted_at' column to 'admins' table.");
    }
  } catch (err) {
    console.error("Self-healing database check failed:", err);
  }
})();

export default pool;
