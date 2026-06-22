import { updateCoordinatesAdmin } from "../../../database/adminQuery/coordinates/updateCoordinatesAdmin.js";
import { logAudit } from "../../../services/admin/auditService.js";
import apicache from "apicache";

export const updateCoordinatesController = async (req, res) => {
  try {
    const { nodeId, coordinates, floor } = req.body;
    if (!nodeId || !coordinates) {
      return res.status(400).json({ success: false, message: "nodeId and coordinates are required", data: null });
    }

    const data = await updateCoordinatesAdmin(Number(nodeId), coordinates, floor || "1");

    // Log the update in audit logs
    await logAudit({
      action: "updated coordinates",
      entityType: "coordinates",
      entityId: Number(nodeId),
      locationName: `Node ID: ${nodeId}`,
      adminUser: req.adminUser,
      oldValue: null, // can be empty
      newValue: { coordinates },
    });

    apicache.clear();
    res.json({ success: true, message: "Coordinates updated", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
