import { deleteHotspotAdmin, getHotspotByIdAdmin } from "../../../database/adminQuery/AdminQuery.js";
import apicache from "apicache";
import { logAudit } from "../../../services/admin/auditService.js";

export const deleteHotspotController = async (req, res) => {
  try {
    const old = await getHotspotByIdAdmin(req.params.id);
    await deleteHotspotAdmin(req.params.id);
    await logAudit({
      action: "deleted hotspot",
      entityType: "hotspot",
      entityId: Number(req.params.id),
      locationName: old?.source_name,
      adminUser: req.adminUser,
      oldValue: old,
    });
    apicache.clear();
    res.json({ success: true, message: "Hotspot deleted", data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
