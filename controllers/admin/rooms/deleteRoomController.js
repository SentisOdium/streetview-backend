import { deleteRoomAdmin, getRoomByIdAdmin } from "../../../database/adminQuery/AdminQuery.js";
import apicache from "apicache";
import { logAudit } from "../../../services/admin/auditService.js";

export const deleteRoomController = async (req, res) => {
  try {
    const old = await getRoomByIdAdmin(req.params.id);
    await deleteRoomAdmin(req.params.id);
    await logAudit({
      action: "deleted room",
      entityType: "room",
      entityId: Number(req.params.id),
      locationName: old?.node_name,
      adminUser: req.adminUser,
      oldValue: old,
    });
    apicache.clear();
    res.json({ success: true, message: "Room deleted", data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
