import { updateHotspotAdmin } from "../../../database/adminQuery/AdminQuery.js";
import apicache from "apicache";
import { logAudit } from "../../../services/admin/auditService.js";

export const updateHotspotController = async (req, res) => {
  try {
    await updateHotspotAdmin(req.params.id, req.body);
    await logAudit({
      action: "updated hotspot",
      entityType: "hotspot",
      entityId: Number(req.params.id),
      adminUser: req.adminUser,
      oldValue: req.body._old,
      newValue: req.body,
    });
    apicache.clear();
    res.json({ success: true, message: "Hotspot updated", data: { updated: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
