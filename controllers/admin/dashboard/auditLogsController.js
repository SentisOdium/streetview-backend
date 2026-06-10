import { getAuditLogs } from "../../../services/admin/auditService.js";

export const auditLogsController = async (req, res) => {
  try {
    const data = await getAuditLogs({ limit: Number(req.query.limit) || 50 });
    res.json({ success: true, message: "Audit logs", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
