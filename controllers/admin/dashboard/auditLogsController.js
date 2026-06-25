import { getAuditLogs } from "../../../services/admin/auditService.js";
import { catchAsync } from "../../../middleware/catchAsync.js";

export const auditLogsController = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const data = await getAuditLogs({ limit, offset });
  res.json({ success: true, message: "Audit logs", data });
});
