import { updateHotspotAdmin, getHotspotByIdAdmin } from "../../../database/adminQuery/AdminQuery.js";
import apicache from "apicache";
import { logAudit } from "../../../services/admin/auditService.js";

export const updateHotspotController = async (req, res) => {
  try {
    const old = await getHotspotByIdAdmin(req.params.id);
    await updateHotspotAdmin(req.params.id, req.body);
    const updated = await getHotspotByIdAdmin(req.params.id);
    await logAudit({
      action: "updated hotspot",
      entityType: "hotspot",
      entityId: Number(req.params.id),
      locationName: old?.source_name,
      adminUser: req.adminUser,
      oldValue: old,
      newValue: updated,
    });
    apicache.clear();
    res.json({ success: true, message: "Hotspot updated", data: { updated: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
