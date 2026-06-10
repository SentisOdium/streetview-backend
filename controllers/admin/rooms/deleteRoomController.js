import { deleteRoomAdmin } from "../../../database/adminQuery/AdminQuery.js";
import apicache from "apicache";

export const deleteRoomController = async (req, res) => {
  try {
    await deleteRoomAdmin(req.params.id);
    apicache.clear();
    res.json({ success: true, message: "Room deleted", data: { deleted: true } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
