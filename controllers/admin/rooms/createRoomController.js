import { createRoomAdmin } from "../../../database/adminQuery/AdminQuery.js";
import apicache from "apicache";
import { logAudit } from "../../../services/admin/auditService.js";

export const createRoomController = async (req, res) => {
  try {
    const result = await createRoomAdmin(req.params.nodeId, req.body);
    await logAudit({
      action: "created room",
      entityType: "room",
      entityId: result.id,
      adminUser: req.adminUser,
      newValue: req.body,
    });
    apicache.clear();
    res.status(201).json({ success: true, message: "Room created", data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
