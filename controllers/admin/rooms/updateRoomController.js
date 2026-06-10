import { updateRoomAdmin } from "../../../database/adminQuery/AdminQuery.js";
import apicache from "apicache";

export const updateRoomController = async (req, res) => {
  try {
    await updateRoomAdmin(req.params.id, req.body);
    apicache.clear();
    res.json({ success: true, message: "Room updated", data: { updated: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
