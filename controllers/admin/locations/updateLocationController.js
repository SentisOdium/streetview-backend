import { getLocationByIdAdmin, updateLocationAdmin } from "../../../database/adminQuery/AdminQuery.js";
import apicache from "apicache";
import { logAudit } from "../../../services/admin/auditService.js";

export const updateLocationController = async (req, res) => {
  try {
    const old = await getLocationByIdAdmin(req.params.id);
    const data = await updateLocationAdmin(req.params.id, req.body);
    await logAudit({
      action: "updated location",
      entityType: "location",
      entityId: Number(req.params.id),
      locationName: data?.node_name,
      adminUser: req.adminUser,
      oldValue: old,
      newValue: data,
    });
    apicache.clear();
    res.json({ success: true, message: "Location updated", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
