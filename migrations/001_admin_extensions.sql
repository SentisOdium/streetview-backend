-- Optional migration for admin panel enhancements.
-- Run against your MySQL database when ready.

ALTER TABLE node_hotspots
  ADD COLUMN IF NOT EXISTS yaw FLOAT NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pitch FLOAT NULL DEFAULT NULL;

CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NULL,
  location_name VARCHAR(255) NULL,
  admin_user VARCHAR(100) DEFAULT 'admin',
  old_value JSON NULL,
  new_value JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log (created_at DESC);
