import pool from '../../config/db.js';

async function createUsabilityTables() {
  try {
    // Create usability_sessions table
    const createSessionsQuery = `
      CREATE TABLE IF NOT EXISTS usability_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_uuid VARCHAR(36) NOT NULL UNIQUE,
        version ENUM('A', 'B', 'C') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL
      )
    `;
    await pool.query(createSessionsQuery);
    console.log("Table 'usability_sessions' created or already exists.");

    // Create usability_tasks_logs table
    const createTasksLogsQuery = `
      CREATE TABLE IF NOT EXISTS usability_tasks_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        task_number INT NOT NULL,
        status ENUM('started', 'completed', 'skipped') NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        duration_ms INT NULL,
        interactions_count INT DEFAULT 0,
        used_search BOOLEAN DEFAULT FALSE,
        used_minimap BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (session_id) REFERENCES usability_sessions(id) ON DELETE CASCADE
      )
    `;
    await pool.query(createTasksLogsQuery);
    console.log("Table 'usability_tasks_logs' created or already exists.");

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

createUsabilityTables();
