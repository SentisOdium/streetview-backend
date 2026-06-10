import { getRoomsByNodeIdAdmin } from "../../../database/adminQuery/AdminQuery.js";

export const listRoomsController = async (req, res) => {
  try {
    const data = await getRoomsByNodeIdAdmin(req.params.nodeId);
    res.json({ success: true, message: "Rooms", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
