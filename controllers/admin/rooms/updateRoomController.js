import { updateRoomAdmin, getRoomByIdAdmin } from "../../../database/adminQuery/AdminQuery.js";
import apicache from "apicache";
import { logAudit } from "../../../services/admin/auditService.js";

export const updateRoomController = async (req, res) => {
  try {
    const old = await getRoomByIdAdmin(req.params.id);
    await updateRoomAdmin(req.params.id, req.body);
    const updated = await getRoomByIdAdmin(req.params.id);
    await logAudit({
      action: "updated room",
      entityType: "room",
      entityId: Number(req.params.id),
      locationName: old?.node_name,
      adminUser: req.adminUser,
      oldValue: old,
      newValue: updated,
    });
    apicache.clear();
    res.json({ success: true, message: "Room updated", data: { updated: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
