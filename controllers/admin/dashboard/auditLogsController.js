import { getAuditLogs } from "../../../services/admin/auditService.js";

export const auditLogsController = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;
    const data = await getAuditLogs({ limit, offset });
    res.json({ success: true, message: "Audit logs", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
