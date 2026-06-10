import { createLocationAdmin } from "../../../database/adminQuery/AdminQuery.js";
import apicache from "apicache";
import { logAudit } from "../../../services/admin/auditService.js";
import { validateBeforeSave } from "../../../services/admin/validationService.js";

export const createLocationController = async (req, res) => {
  try {
    const validation = await validateBeforeSave("location", req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: "Validation failed", data: validation });
    }
    const result = await createLocationAdmin(req.body);
    await logAudit({
      action: "created location",
      entityType: "location",
      entityId: result.id,
      locationName: req.body.node_name,
      adminUser: req.adminUser,
      newValue: req.body,
    });
    apicache.clear();
    res.status(201).json({ success: true, message: "Location created", data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
