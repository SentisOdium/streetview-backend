import pool from '../../config/db.js';

async function createUsabilityActionLogsTable() {
  try {
    const createLogsQuery = `
      CREATE TABLE IF NOT EXISTS usability_action_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        task_number INT NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        event_target VARCHAR(255) NOT NULL,
        is_allowed BOOLEAN NOT NULL DEFAULT TRUE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES usability_sessions(id) ON DELETE CASCADE
      )
    `;
    await pool.query(createLogsQuery);
    console.log("Table 'usability_action_logs' created or already exists.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

createUsabilityActionLogsTable();
