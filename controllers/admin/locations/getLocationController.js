import { getLocationByIdAdmin, getHotspotsByNodeIdAdmin, getRoomsByNodeIdAdmin } from "../../../database/adminQuery/AdminQuery.js";

export const getLocationController = async (req, res) => {
  try {
    const data = await getLocationByIdAdmin(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Not found", data: null });
    const hotspots = await getHotspotsByNodeIdAdmin(req.params.id);
    const rooms = await getRoomsByNodeIdAdmin(req.params.id);
    res.json({ success: true, message: "Location details", data: { ...data, hotspots, rooms } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
