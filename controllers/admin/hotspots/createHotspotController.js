import { createHotspotAdmin } from "../../../database/adminQuery/AdminQuery.js";
import apicache from "apicache";
import { logAudit } from "../../../services/admin/auditService.js";
import { validateBeforeSave } from "../../../services/admin/validationService.js";

export const createHotspotController = async (req, res) => {
  try {
    const validation = await validateBeforeSave("hotspot", req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: "Validation failed", data: validation });
    }
    const result = await createHotspotAdmin(req.params.nodeId, req.body);
    await logAudit({
      action: "created hotspot",
      entityType: "hotspot",
      entityId: result.id,
      locationName: req.body.source_name,
      adminUser: req.adminUser,
      newValue: req.body,
    });
    apicache.clear();
    res.status(201).json({ success: true, message: "Hotspot created", data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
