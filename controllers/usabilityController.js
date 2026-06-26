import pool from "../config/db.js";

export const startSession = async (req, res, next) => {
  try {
    const { session_uuid, version } = req.body;

    if (!session_uuid || !version) {
      return res.status(400).json({ success: false, message: "Missing session_uuid or version" });
    }

    // Use upsert to prevent race condition (e.g., from React Strict Mode double requests)
    await pool.query(
      "INSERT INTO usability_sessions (session_uuid, version) VALUES (?, ?) ON DUPLICATE KEY UPDATE version = VALUES(version)",
      [session_uuid, version]
    );

    // Fetch the ID to return it, in case the frontend needs it later
    const [existing] = await pool.query(
      "SELECT id FROM usability_sessions WHERE session_uuid = ?",
      [session_uuid]
    );
    const sessionId = existing[0].id;

    res.status(200).json({
      success: true,
      data: { session_id: sessionId }
    });
  } catch (error) {
    next(error);
  }
};

export const logTask = async (req, res, next) => {
  try {
    const {
      session_uuid, // We'll accept uuid to lookup the session_id
      task_number,
      status,
      duration_ms,
      interactions_count,
      used_search,
      used_minimap
    } = req.body;

    if (!session_uuid || task_number === undefined || !status) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Lookup session_id
    const [sessions] = await pool.query(
      "SELECT id FROM usability_sessions WHERE session_uuid = ?",
      [session_uuid]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const sessionId = sessions[0].id;
    
    // Convert status for database ENUM compatibility
    const safeStatus = ['started', 'completed', 'skipped'].includes(status) ? status : 'started';
    const completedAt = (safeStatus === 'completed' || safeStatus === 'skipped') ? new Date() : null;
    const now = new Date();
    // Assuming started_at is now - duration_ms
    const startedAt = duration_ms ? new Date(now.getTime() - duration_ms) : now;

    // Check if task is already logged for this session, we can do an insert or update.
    // For simplicity, we'll insert a new log row every time they finish or skip, assuming they don't redo.
    // Or we could upsert. Since there is no unique constraint on (session_id, task_number), we'll insert.
    const [result] = await pool.query(
      `INSERT INTO usability_tasks_logs 
        (session_id, task_number, status, started_at, completed_at, duration_ms, interactions_count, used_search, used_minimap) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        task_number,
        safeStatus,
        startedAt,
        completedAt,
        duration_ms || 0,
        interactions_count || 0,
        used_search || false,
        used_minimap || false
      ]
    );

    res.status(201).json({
      success: true,
      message: "Task logged successfully",
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

export const logTasksBulk = async (req, res, next) => {
  try {
    const { session_uuid, tasks } = req.body;

    if (!session_uuid || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, message: "Missing required fields or empty tasks array" });
    }

    // Lookup session_id
    const [sessions] = await pool.query(
      "SELECT id FROM usability_sessions WHERE session_uuid = ?",
      [session_uuid]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const sessionId = sessions[0].id;
    const now = new Date();

    // Prepare values for bulk insert
    const values = tasks.map(task => {
      const safeStatus = ['started', 'completed', 'skipped'].includes(task.status) ? task.status : 'started';
      const completedAt = (safeStatus === 'completed' || safeStatus === 'skipped') ? now : null;
      const durationMs = task.duration_ms || 0;
      const startedAt = durationMs ? new Date(now.getTime() - durationMs) : now;

      return [
        sessionId,
        task.task_number,
        safeStatus,
        startedAt,
        completedAt,
        durationMs,
        task.interactions_count || 0,
        task.used_search || false,
        task.used_minimap || false
      ];
    });

    const [result] = await pool.query(
      `INSERT INTO usability_tasks_logs 
        (session_id, task_number, status, started_at, completed_at, duration_ms, interactions_count, used_search, used_minimap) 
       VALUES ?`,
      [values]
    );

    res.status(201).json({
      success: true,
      message: `${result.affectedRows} tasks logged successfully`,
      data: { affectedRows: result.affectedRows }
    });
  } catch (error) {
    next(error);
  }
};
