import { getHotspotsByNodeIdAdmin, getAllHotspotsAdmin } from "../../../database/adminQuery/AdminQuery.js";

export const listHotspotsController = async (req, res) => {
  try {
    const data = req.params.nodeId
      ? await getHotspotsByNodeIdAdmin(req.params.nodeId)
      : await getAllHotspotsAdmin();
    res.json({ success: true, message: "Hotspots", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
