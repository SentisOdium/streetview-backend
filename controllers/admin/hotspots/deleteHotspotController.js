import { deleteHotspotAdmin } from "../../../database/adminQuery/AdminQuery.js";
import apicache from "apicache";
import { logAudit } from "../../../services/admin/auditService.js";

export const deleteHotspotController = async (req, res) => {
  try {
    await deleteHotspotAdmin(req.params.id);
    await logAudit({
      action: "deleted hotspot",
      entityType: "hotspot",
      entityId: Number(req.params.id),
      adminUser: req.adminUser,
    });
    apicache.clear();
    res.json({ success: true, message: "Hotspot deleted", data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
