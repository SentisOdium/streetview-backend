import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_AWS_HOST,
    user: process.env.MYSQL_AWS_USER,
    password: process.env.MYSQL_AWS_PASSWORD,
    database: process.env.MYSQL_AWS_DATABASE,
    port: process.env.MYSQL_AWS_PORT,
    connectionLimit: 50, // Adjust the connection limit as needed
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

    // Create admin_password_resets table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_verified TINYINT(1) DEFAULT 0,
        failed_attempts INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB
    `);
    console.log("Self-healing: Checked/created 'admin_password_resets' table.");
  } catch (err) {
    console.error("Self-healing database check failed:", err);
  }
})();

export default pool;
