import { getAuditLogs } from "../../../services/admin/auditService.js";
import { catchAsync } from "../../../middleware/catchAsync.js";

export const auditLogsController = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const { search, entityType, adminUser, action, date } = req.query;

  const data = await getAuditLogs({
    limit,
    offset,
    search,
    entityType,
    adminUser,
    action,
    date,
  });
  res.json({ success: true, message: "Audit logs", data });
});
