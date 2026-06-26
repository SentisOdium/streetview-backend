import pool from "../config/db.js";

export const startSession = async (req, res, next) => {
  try {
    const { session_uuid, version } = req.body;

    if (!session_uuid || !version) {
      return res.status(400).json({ success: false, message: "Missing session_uuid or version" });
    }

    // Check if session already exists
    const [existing] = await pool.query(
      "SELECT id FROM usability_sessions WHERE session_uuid = ?",
      [session_uuid]
    );

    let sessionId;
    if (existing.length > 0) {
      sessionId = existing[0].id;
      // Update version if needed
      await pool.query(
        "UPDATE usability_sessions SET version = ? WHERE id = ?",
        [version, sessionId]
      );
    } else {
      const [result] = await pool.query(
        "INSERT INTO usability_sessions (session_uuid, version) VALUES (?, ?)",
        [session_uuid, version]
      );
      sessionId = result.insertId;
    }

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
