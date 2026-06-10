import { getLocationByIdAdmin, deleteLocationAdmin } from "../../../database/adminQuery/AdminQuery.js";
import apicache from "apicache";
import { logAudit } from "../../../services/admin/auditService.js";

export const deleteLocationController = async (req, res) => {
  try {
    const old = await getLocationByIdAdmin(req.params.id);
    await deleteLocationAdmin(req.params.id);
    await logAudit({
      action: "deleted location",
      entityType: "location",
      entityId: Number(req.params.id),
      locationName: old?.node_name,
      adminUser: req.adminUser,
      oldValue: old,
    });
    apicache.clear();
    res.json({ success: true, message: "Location deleted", data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
